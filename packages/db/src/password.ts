import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Password hashing with scrypt.
 *
 * scrypt is memory-hard and ships in Node's standard library, so this adds no
 * dependency and no native build step. Parameters follow the Node defaults
 * (N=16384, r=8, p=1), which cost roughly 16 MB and ~50-100ms per hash.
 *
 * Stored format:  scrypt$<N>$<r>$<p>$<salt-base64>$<hash-base64>
 */

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;
const PREFIX = "scrypt$";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await scryptAsync(password, salt, KEYLEN, { N, r: R, p: P });
  return `${PREFIX}${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/** True when `stored` is in our hash format (rather than a legacy plaintext). */
export function isHashed(stored: string): boolean {
  return stored.startsWith(PREFIX);
}

/**
 * Verify a password against a stored value.
 *
 * Legacy plaintext entries are compared directly so that a store seeded before
 * hashing existed still authenticates — `authenticate()` then upgrades them.
 */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  if (!isHashed(stored)) {
    const a = Buffer.from(password);
    const b = Buffer.from(stored);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  const parts = stored.slice(PREFIX.length).split("$");
  if (parts.length !== 5) return false;
  const [nRaw, rRaw, pRaw, saltRaw, hashRaw] = parts as [
    string,
    string,
    string,
    string,
    string,
  ];

  const params = { N: Number(nRaw), r: Number(rRaw), p: Number(pRaw) };
  if (!params.N || !params.r || !params.p) return false;

  const expected = Buffer.from(hashRaw, "base64");
  let actual: Buffer;
  try {
    actual = await scryptAsync(
      password,
      Buffer.from(saltRaw, "base64"),
      expected.length,
      params,
    );
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
