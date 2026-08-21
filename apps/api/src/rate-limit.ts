import type { Context, MiddlewareHandler } from "hono";

/**
 * In-memory sliding-window rate limiting.
 *
 * No dependency: the counters are a Map, in keeping with `password.ts` using
 * `node:crypto` rather than a hashing library.
 *
 * LIMITATION — state is per-process and resets on restart. That is correct for
 * the single `api` service in docker/compose.prod.yml and wrong the moment
 * there is a second replica. See docs/api/auth.md for the successor.
 */

const DISABLED = process.env.NUSA_RATELIMIT_DISABLED === "1";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export const LOGIN_MAX = envInt("NUSA_RATELIMIT_LOGIN_MAX", 10);
export const LOGIN_WINDOW_MS = envInt("NUSA_RATELIMIT_LOGIN_WINDOW_MS", 15 * 60 * 1000);
export const LOGIN_EMAIL_MAX = envInt("NUSA_RATELIMIT_LOGIN_EMAIL_MAX", 5);
export const WRITE_MAX = envInt("NUSA_RATELIMIT_WRITE_MAX", 20);
export const WRITE_WINDOW_MS = envInt("NUSA_RATELIMIT_WRITE_WINDOW_MS", 60 * 60 * 1000);

/** Timestamps of recent hits, per bucket. */
const buckets = new Map<string, number[]>();

/** Test hook — clears all counters. */
export function __resetLimiter(): void {
  buckets.clear();
}

export type Decision = {
  allowed: boolean;
  /** Seconds until the oldest hit falls out of the window. */
  retryAfter: number;
};

/**
 * Record a hit against `bucket` and decide whether it is allowed.
 * Exported so the behaviour can be tested without an HTTP server.
 */
export function consume(
  bucket: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): Decision {
  if (DISABLED) return { allowed: true, retryAfter: 0 };

  const cutoff = now - windowMs;
  const hits = (buckets.get(bucket) ?? []).filter((t) => t > cutoff);

  if (hits.length >= limit) {
    const oldest = hits[0]!;
    buckets.set(bucket, hits);
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  hits.push(now);
  buckets.set(bucket, hits);
  return { allowed: true, retryAfter: 0 };
}

/**
 * The caller's address.
 *
 * The API listens on loopback and is only reachable through the host Caddy, so
 * the socket peer is always 127.0.0.1 and useless as a key.
 *
 * Caddy *appends* to X-Forwarded-For, and a client may send that header itself
 * — so the LEFTMOST entry is attacker-controlled and must never be used. The
 * rightmost entry is the one our own Caddy appended.
 *
 * For Cloudflare-proxied hosts (apex, www, island hubs) Caddy's peer is
 * Cloudflare, so the rightmost entry is a Cloudflare address and the real
 * client is CF-Connecting-IP. Nested place hosts are grey-clouded and have no
 * such header, which is why it is a preference rather than a requirement.
 */
export function resolveClientIp(c: Context): string {
  const cf = c.req.header("cf-connecting-ip")?.trim();
  if (cf) return cf;

  const xff = c.req.header("x-forwarded-for");
  if (xff) {
    const parts = xff
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return "unknown";
}

export type RateLimitOptions = {
  /** Namespace, so two routes with the same key don't share a bucket. */
  id: string;
  limit: number;
  windowMs: number;
  /** Defaults to the client IP. */
  key?: (c: Context) => string | Promise<string>;
};

/**
 * Per-route middleware. Never apply globally: GET /v1/tls-check is Caddy's
 * on_demand_tls ask endpoint and GET /health is polled by the deploy gate —
 * a 429 on either is an outage, not a slow-down.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  const { id, limit, windowMs, key } = options;
  return async (c, next) => {
    const raw = key ? await key(c) : resolveClientIp(c);
    const decision = consume(`${id}:${raw}`, limit, windowMs);
    if (!decision.allowed) {
      c.header("Retry-After", String(decision.retryAfter));
      return c.json({ error: "Too many requests" }, 429);
    }
    await next();
  };
}

/** Login throttle keyed on the account, capping a distributed attack on one user. */
export function loginEmailKey(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "unknown";
}
