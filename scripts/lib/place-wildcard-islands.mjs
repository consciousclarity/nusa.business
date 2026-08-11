/**
 * Island slugs that need a grey-cloud `*.{island}.nusa.business` A record.
 * Keep in sync with packages/db/src/seed-data.ts island slugs.
 *
 * Nested place hosts cannot use Cloudflare Free Universal SSL (one label
 * only), so these wildcards must be DNS-only and terminate TLS at Caddy.
 */
export const PLACE_WILDCARD_ISLANDS = [
  "bali",
  "java",
  "lombok",
  "sumatra",
  "sulawesi",
  "kalimantan",
  "maluku",
  "papua",
];

/**
 * Former island slugs that used to have place wildcards. After a rename
 * migration (see packages/db/src/migrations.ts), `cf:zone` must delete these
 * so they are not left pointing at the origin while the new slug is missing
 * and falls through to the orange `*` record.
 */
export const OBSOLETE_PLACE_WILDCARD_ISLANDS = ["jawa", "sumatera"];

/** Cloudflare DNS record name for an island place wildcard. */
export function placeWildcardName(island, zoneName = "nusa.business") {
  return `*.${island}.${zoneName}`;
}
