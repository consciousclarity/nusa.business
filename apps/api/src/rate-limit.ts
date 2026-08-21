import { createHash } from "node:crypto";
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
/**
 * Cap on writes to a single listing from all clients combined, so a listing
 * cannot be flooded from many addresses at once. Higher than WRITE_MAX because
 * it aggregates every legitimate visitor to that listing.
 */
export const BUSINESS_WRITE_MAX = envInt("NUSA_RATELIMIT_BUSINESS_WRITE_MAX", 60);
export const WRITE_WINDOW_MS = envInt("NUSA_RATELIMIT_WRITE_WINDOW_MS", 60 * 60 * 1000);

/** Hard ceiling on tracked keys, so a high-cardinality flood cannot exhaust memory. */
export const MAX_BUCKETS = envInt("NUSA_RATELIMIT_MAX_BUCKETS", 20_000);

type Bucket = {
  /** Timestamps of recent hits. */
  hits: number[];
  /** The limit this bucket was last checked against, so eviction can tell an
   *  idle bucket from one that is actively throttling someone. */
  limit: number;
};

/** Insertion-ordered, which eviction relies on. */
const buckets = new Map<string, Bucket>();

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
  for (const [key, bucket] of buckets) {
    const newest = bucket.hits[bucket.hits.length - 1];
    if (newest === undefined || newest <= cutoff) buckets.delete(key);
  }
  enforceCeiling(now);
}

/**
 * Evict oldest-first until the ceiling holds — but never evict a bucket that is
 * currently at its limit.
 *
 * Evicting a throttling bucket would *reset a protection*, which an attacker
 * who controls part of the key space could trigger deliberately: flood enough
 * distinct keys to push the bucket guarding a target account out of the map,
 * then resume guessing against it. Skipping active buckets makes eviction a
 * cache concern rather than a security one.
 *
 * Idle buckets are always available to evict in practice, because a bucket only
 * becomes throttling after `limit` hits inside the window.
 */
function enforceCeiling(now: number = Date.now()): void {
  if (buckets.size <= MAX_BUCKETS) return;
  const excess = buckets.size - MAX_BUCKETS;
  let removed = 0;
  for (const [key, bucket] of buckets) {
    const live = bucket.hits.filter((t) => t > now - longestWindowMs());
    if (live.length >= bucket.limit) continue; // actively throttling — keep
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
/**
 * Would this bucket admit one more hit? Does not mutate anything.
 *
 * Separated from recording so a check spanning several limits can be
 * all-or-nothing: a request refused by a later limit must not have been
 * charged against an earlier one.
 */
export function peek(
  bucket: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): Decision {
  if (DISABLED) return { allowed: true, retryAfter: 0 };

  const cutoff = now - windowMs;
  const hits = (buckets.get(bucket)?.hits ?? []).filter((t) => t > cutoff);
  if (hits.length < limit) return { allowed: true, retryAfter: 0 };

  const oldest = hits[0]!;
  return {
    allowed: false,
    retryAfter: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
  };
}

/** Charge one hit against `bucket`. Call only after every relevant peek passed. */
function record(
  bucket: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): void {
  if (DISABLED) return;

  if (++writesSinceSweep >= SWEEP_EVERY || buckets.size > MAX_BUCKETS) {
    writesSinceSweep = 0;
    sweepBuckets(now);
  }

  const cutoff = now - windowMs;
  const hits = (buckets.get(bucket)?.hits ?? []).filter((t) => t > cutoff);
  hits.push(now);
  buckets.set(bucket, { hits, limit });
  enforceCeiling(now);
}

/**
 * Check one limit and charge it if it passes.
 *
 * A refused request is never charged, so repeated rejections cannot deepen the
 * hole the caller is already in.
 */
export function consume(
  bucket: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): Decision {
  const decision = peek(bucket, limit, windowMs, now);
  if (decision.allowed) record(bucket, limit, windowMs, now);
  return decision;
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

/**
 * Number of slots the login-throttle key space is folded into. A power of two,
 * comfortably below MAX_BUCKETS so this namespace can never drive eviction.
 */
export const LOGIN_EMAIL_SLOTS = 4096;

/**
 * Login throttle key, capping a distributed attack on one account.
 *
 * The email is hashed into a fixed number of slots rather than used directly.
 * The address is client-supplied, so using it verbatim would hand an attacker
 * unbounded control over the key space — the root cause of eviction pressure.
 * Folding it bounds that namespace by construction.
 *
 * Collisions mean two accounts occasionally share a throttle. That grants an
 * attacker nothing new: they can already throttle any account by attempting it
 * directly, and the outcome is a temporary lockout, never extra attempts.
 */
export function loginEmailKey(email: unknown): string {
  const normalised =
    typeof email === "string" ? email.trim().toLowerCase() : "unknown";
  const digest = createHash("sha256").update(normalised).digest();
  const slot = digest.readUInt16BE(0) % LOGIN_EMAIL_SLOTS;
  return `s${slot}`;
}


/**
 * Limits for a public write against one listing.
 *
 * Scoped to (client, listing) rather than client alone. With CF-Connecting-IP
 * untrusted, proxied traffic keys on a Cloudflare edge address shared by many
 * real users — a client-only key would let one attacker exhaust the quota and
 * 429 every unrelated visitor behind that same edge. Including the listing
 * narrows the blast radius to people acting on the *same* listing the attacker
 * targeted; everyone reviewing or booking anything else is unaffected.
 *
 * The second, client-independent cap stops a listing being flooded from many
 * edges at once, which the first check alone would permit.
 *
 * `businessId` must be verified to exist before calling: an unchecked id would
 * let an attacker mint unlimited distinct keys.
 */
export function consumeWrite(
  routeId: string,
  ip: string,
  businessId: string,
  now: number = Date.now(),
): Decision {
  const clientKey = `${routeId}:${ip}:${businessId}`;
  const listingKey = `${routeId}-listing:${businessId}`;

  // Both limits are checked before either is charged. Charging the first and
  // then failing the second would mean a refused request still burned the
  // caller's quota — so once a listing hit its aggregate cap, visitors retrying
  // would exhaust their own (client, listing) allowance on requests that were
  // never served, and stay blocked after aggregate capacity returned.
  const perClient = peek(clientKey, WRITE_MAX, WRITE_WINDOW_MS, now);
  if (!perClient.allowed) return perClient;

  const perListing = peek(listingKey, BUSINESS_WRITE_MAX, WRITE_WINDOW_MS, now);
  if (!perListing.allowed) return perListing;

  record(clientKey, WRITE_MAX, WRITE_WINDOW_MS, now);
  record(listingKey, BUSINESS_WRITE_MAX, WRITE_WINDOW_MS, now);
  return { allowed: true, retryAfter: 0 };
}
