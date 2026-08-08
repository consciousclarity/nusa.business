import { createHmac, timingSafeEqual } from "node:crypto";
import { getUser } from "@nusa/db";
import type { UserRole } from "@nusa/shared";
import type { Context, MiddlewareHandler } from "hono";

/**
 * Stateless HMAC-signed bearer tokens.
 *
 * Replaces the previous `dev.${user.id}` scheme, which any client could mint
 * by guessing a user id. Tokens carry the subject and role, are signed with
 * NUSA_AUTH_SECRET, and expire.
 */

const DEV_SECRET = "nusa-dev-secret-do-not-use-in-production";

function loadSecret(): string {
  const secret = process.env.NUSA_AUTH_SECRET;
  if (secret && secret.length >= 16) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NUSA_AUTH_SECRET must be set to at least 16 characters in production",
    );
  }
  if (secret) {
    console.warn("[auth] NUSA_AUTH_SECRET too short (<16 chars); using dev secret");
  } else {
    console.warn("[auth] NUSA_AUTH_SECRET unset; using dev secret (dev only)");
  }
  return DEV_SECRET;
}

const SECRET = loadSecret();
const TOKEN_TTL_SECONDS = Number(process.env.NUSA_TOKEN_TTL ?? 60 * 60 * 24 * 7);

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type AuthVariables = { user: AuthUser };

type TokenPayload = {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
};

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function unb64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string): string {
  return b64url(createHmac("sha256", SECRET).update(body).digest());
}

export function issueToken(user: { id: string; role: UserRole }): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: user.id,
    role: user.role,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

/** Verify signature and expiry. Returns the payload, or null if invalid. */
export function verifyToken(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts as [string, string];

  const expected = unb64url(sign(body));
  const given = unb64url(signature);
  if (expected.length !== given.length) return null;
  if (!timingSafeEqual(expected, given)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(unb64url(body).toString("utf8")) as TokenPayload;
  } catch {
    return null;
  }
  if (!payload.sub || typeof payload.exp !== "number") return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

/**
 * Resolve the caller from the Authorization header.
 *
 * The token is only a claim of identity — the user is re-read from the store
 * so that deletions and role changes take effect immediately.
 */
export function currentUser(c: Context): AuthUser | null {
  const header = c.req.header("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const payload = verifyToken(match[1]!.trim());
  if (!payload) return null;
  const user = getUser(payload.sub);
  if (!user) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

/** Require a valid token. Populates `c.get("user")`. */
export const requireAuth: MiddlewareHandler<{ Variables: AuthVariables }> = async (
  c,
  next,
) => {
  const user = currentUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", user);
  await next();
};

/** Require a valid token whose user holds one of `roles`. */
export function requireRole(
  ...roles: UserRole[]
): MiddlewareHandler<{ Variables: AuthVariables }> {
  return async (c, next) => {
    const user = currentUser(c);
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    if (!roles.includes(user.role)) {
      return c.json({ error: "Forbidden" }, 403);
    }
    c.set("user", user);
    await next();
  };
}

/** True when the caller owns the resource, or is an admin. */
export function ownsOrAdmin(user: AuthUser, ownerUserId?: string): boolean {
  return user.role === "admin" || (!!ownerUserId && ownerUserId === user.id);
}
