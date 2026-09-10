/**
 * Host slugs that need a grey-cloud `*.{slug}.nusa.business` A record.
 * Keep in sync with packages/db/src/indonesia-admin.ts province slugs
 * plus legacy region hubs (java, sumatra, …) so old place hosts can 301.
 *
 * Nested place hosts cannot use Cloudflare Free Universal SSL (one label
 * only), so these wildcards must be DNS-only and terminate TLS at Caddy.
 */
export const PROVINCE_HOST_SLUGS = [
  "aceh",
  "sumatera-utara",
  "sumatera-barat",
  "riau",
  "jambi",
  "sumatera-selatan",
  "bengkulu",
  "lampung",
  "kepulauan-bangka-belitung",
  "kepulauan-riau",
  "dki-jakarta",
  "jawa-barat",
  "jawa-tengah",
  "di-yogyakarta",
  "jawa-timur",
  "banten",
  "bali",
  "nusa-tenggara-barat",
  "nusa-tenggara-timur",
  "kalimantan-barat",
  "kalimantan-tengah",
  "kalimantan-selatan",
  "kalimantan-timur",
  "kalimantan-utara",
  "sulawesi-utara",
  "sulawesi-tengah",
  "sulawesi-selatan",
  "sulawesi-tenggara",
  "gorontalo",
  "sulawesi-barat",
  "maluku",
  "maluku-utara",
  "papua-barat",
  "papua-barat-daya",
  "papua",
  "papua-selatan",
  "papua-tengah",
  "papua-pegunungan",
];

/** Region / alias hubs that still receive place-host TLS during 301s. */
export const LEGACY_REGION_HOST_SLUGS = [
  "java",
  "lombok",
  "sumatra",
  "sulawesi",
  "kalimantan",
];

export const PLACE_WILDCARD_ISLANDS = [
  ...PROVINCE_HOST_SLUGS,
  ...LEGACY_REGION_HOST_SLUGS,
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
