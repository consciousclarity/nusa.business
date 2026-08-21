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

/**
 * Whether to believe `CF-Connecting-IP`.
 *
 * OFF by default, and that default is load-bearing. The origin is publicly
 * reachable — it has to be, because grey-clouded place hosts get their
 * certificates by direct ACME — so anyone can connect straight to it with a
 * `Host:` header and an invented `CF-Connecting-IP`. Caddy passes the header
 * through untouched, so trusting it would let an attacker rotate a header and
 * mint a fresh bucket per request: no limit at all.
 *
 * Only enable this once direct-to-origin access is impossible — the origin
 * firewalled to Cloudflare's published ranges, or authenticated origin pulls.
 * Until then the Caddy-observed peer is the only address a client cannot forge.
 */
const TRUST_CF_HEADER = process.env.NUSA_TRUST_CF_CONNECTING_IP === "1";

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * The per-address login limit is deliberately loose. With CF-Connecting-IP
 * untrusted, proxied traffic keys on a Cloudflare edge address shared by many
 * real users, so a tight limit here would lock out bystanders. The per-account
 * limit below is the control that actually stops credential attacks, and it
 * does not depend on addresses at all.
 */
export const LOGIN_MAX = envInt("NUSA_RATELIMIT_LOGIN_MAX", 30);
export const LOGIN_WINDOW_MS = envInt("NUSA_RATELIMIT_LOGIN_WINDOW_MS", 15 * 60 * 1000);
export const LOGIN_EMAIL_MAX = envInt("NUSA_RATELIMIT_LOGIN_EMAIL_MAX", 5);
export const WRITE_MAX = envInt("NUSA_RATELIMIT_WRITE_MAX", 20);
export const WRITE_WINDOW_MS = envInt("NUSA_RATELIMIT_WRITE_WINDOW_MS", 60 * 60 * 1000);

/** Hard ceiling on tracked keys, so a high-cardinality flood cannot exhaust memory. */
export const MAX_BUCKETS = envInt("NUSA_RATELIMIT_MAX_BUCKETS", 20_000);

/** Timestamps of recent hits, per bucket. Insertion-ordered, which eviction relies on. */
const buckets = new Map<string, number[]>();

/** Sweep every N writes rather than on a timer — no handle to leak, no clock to stub. */
const SWEEP_EVERY = 500;
let writesSinceSweep = 0;

/** Test hooks. */
export function __resetLimiter(): void {
  buckets.clear();
  writesSinceSweep = 0;
}
export function __bucketCount(): number {
  return buckets.size;
}

function longestWindowMs(): number {
  return Math.max(LOGIN_WINDOW_MS, WRITE_WINDOW_MS);
}

/**
 * Drop buckets whose most recent hit has aged out, then evict oldest-first if
 * still over the ceiling.
 *
 * Without this the Map grows for the process's lifetime: every distinct client
 * address, and — worse — every distinct email submitted to the login route,
 * which an attacker controls outright.
 */
export function sweepBuckets(now: number = Date.now()): void {
  const cutoff = now - longestWindowMs();
  for (const [key, hits] of buckets) {
    const newest = hits[hits.length - 1];
    if (newest === undefined || newest <= cutoff) buckets.delete(key);
  }
  enforceCeiling();
}

/**
 * Evict oldest-first until the ceiling holds. Map preserves insertion order,
 * so the front is the least recently created key.
 *
 * Under a flood this can drop a bucket that still had counts, which resets that
 * key's limit — inherent to any bounded cache, and far preferable to unbounded
 * growth driven by attacker-supplied keys.
 */
function enforceCeiling(): void {
  if (buckets.size <= MAX_BUCKETS) return;
  const excess = buckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const key of buckets.keys()) {
    buckets.delete(key);
    if (++removed >= excess) break;
  }
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

  if (++writesSinceSweep >= SWEEP_EVERY || buckets.size > MAX_BUCKETS) {
    writesSinceSweep = 0;
    sweepBuckets(now);
  }

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
  enforceCeiling();
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
 * RIGHTMOST entry is the address our own Caddy observed, which a client cannot
 * forge. That is the only trustworthy identifier available here, which is why
 * CF-Connecting-IP is opt-in (see TRUST_CF_HEADER).
 */
export function resolveClientIp(c: Context): string {
  if (TRUST_CF_HEADER) {
    const cf = c.req.header("cf-connecting-ip")?.trim();
    if (cf) return cf;
  }

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
  /** Defaults to the client address. */
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
