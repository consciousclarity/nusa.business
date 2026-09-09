#!/usr/bin/env node
/**
 * Fill missing listing lat/lng in a JSON store so similar-within-2km
 * discovery has a non-null origin.
 *
 * Standalone: no @nusa/db, no compile step. Safe to curl from GitHub and
 * run on Hermes before this file exists in /opt/nusa.business.
 *
 * Match order for each listing:
 *   1. Seed coords by business id
 *   2. Seed coords by slug (placeId:slug, then slug)
 *   3. Place-slug / place-id centroid + deterministic 50–150 m jitter
 *   4. Island centroid + jitter (last resort so every listing gets coords)
 *
 * Existing finite lat+lng are left alone unless --force.
 *
 *   node scripts/backfill-listing-coords.mjs --store /opt/nusa.business/.data/store.json
 */

import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Seed listings that already have lat/lng in packages/db/src/seed-data.ts. */
export const EMBEDDED_SEED_COORDS = [
  { id: "biz-single-fin", slug: "single-fin-uluwatu", placeId: "pl-uluwatu", lat: -8.8291, lng: 115.0849 },
  { id: "biz-kecak", slug: "uluwatu-temple-kecak", placeId: "pl-uluwatu", lat: -8.8295, lng: 115.0845 },
  { id: "biz-alchemy", slug: "alchemy-uluwatu", placeId: "pl-uluwatu", lat: -8.821, lng: 115.088 },
  { id: "biz-menega", slug: "menega-cafe", placeId: "pl-jimbaran", lat: -8.784, lng: 115.163 },
  { id: "biz-pande-egi", slug: "babi-guling-pande-egi", placeId: "pl-gianyar", lat: -8.5439, lng: 115.325 },
  { id: "biz-kopi-rai", slug: "kopi-ngurah-rai", placeId: "pl-gianyar", lat: -8.5439, lng: 115.325 },
  { id: "biz-celuk", slug: "celuk-silver-workshop", placeId: "pl-gianyar", lat: -8.5485, lng: 115.318 },
  { id: "biz-batik-g", slug: "batik-gianyar-gallery", placeId: "pl-gianyar", lat: -8.5412, lng: 115.331 },
  { id: "biz-warung-pasar", slug: "warung-pasar-gianyar", placeId: "pl-gianyar", lat: -8.5455, lng: 115.3275 },
  { id: "biz-bpr-gianyar", slug: "bpr-gianyar-pusat", placeId: "pl-gianyar", lat: -8.5448, lng: 115.3262 },
  { id: "biz-klinik-g", slug: "klinik-sehat-gianyar", placeId: "pl-gianyar", lat: -8.54, lng: 115.329 },
  { id: "biz-gianyar-weddings", slug: "gianyar-wedding-organizer", placeId: "pl-gianyar", lat: -8.542, lng: 115.328 },
  { id: "biz-gianyar-catering", slug: "ibu-made-catering", placeId: "pl-gianyar", lat: -8.543, lng: 115.327 },
  { id: "biz-ibu-oka", slug: "warung-babi-guling-ibu-oka", placeId: "pl-ubud", lat: -8.5069, lng: 115.2625 },
  { id: "biz-yoga-barn", slug: "yoga-barn-ubud", placeId: "pl-ubud", lat: -8.5195, lng: 115.265 },
  { id: "biz-monkey-cafe", slug: "sacred-monkey-forest-cafe", placeId: "pl-ubud", lat: -8.5188, lng: 115.2594 },
  { id: "biz-nusa-dua-beach", slug: "nusa-dua-beach-hotel", placeId: "pl-nusa-dua", lat: -8.8009, lng: 115.2324 },
  { id: "biz-canggu-scooter", slug: "canggu-scooter-rental", placeId: "pl-canggu", lat: -8.6478, lng: 115.1385 },
  { id: "biz-denpasar-halal", slug: "rumah-makan-halal-denpasar", placeId: "pl-denpasar", lat: -8.6724, lng: 115.2126 },
];

/**
 * Place centroids (tourist-area / kabupaten-kota centres). Keyed by seed
 * place id; slug + islandSlug cover stores whose place ids drifted.
 */
export const PLACE_CENTROIDS = [
  { id: "pl-badung", slug: "badung", islandSlug: "bali", lat: -8.5819, lng: 115.1771 },
  { id: "pl-gianyar", slug: "gianyar", islandSlug: "bali", lat: -8.5439, lng: 115.325 },
  { id: "pl-denpasar", slug: "denpasar", islandSlug: "bali", lat: -8.6705, lng: 115.2126 },
  { id: "pl-buleleng", slug: "buleleng", islandSlug: "bali", lat: -8.12, lng: 115.0919 },
  { id: "pl-karangasem", slug: "karangasem", islandSlug: "bali", lat: -8.45, lng: 115.6167 },
  { id: "pl-uluwatu", slug: "uluwatu", islandSlug: "bali", lat: -8.8291, lng: 115.0849 },
  { id: "pl-jimbaran", slug: "jimbaran", islandSlug: "bali", lat: -8.784, lng: 115.163 },
  { id: "pl-ubud", slug: "ubud", islandSlug: "bali", lat: -8.5069, lng: 115.2625 },
  { id: "pl-canggu", slug: "canggu", islandSlug: "bali", lat: -8.6478, lng: 115.1385 },
  { id: "pl-seminyak", slug: "seminyak", islandSlug: "bali", lat: -8.6912, lng: 115.1571 },
  { id: "pl-sanur", slug: "sanur", islandSlug: "bali", lat: -8.6781, lng: 115.2639 },
  { id: "pl-kuta", slug: "kuta", islandSlug: "bali", lat: -8.7237, lng: 115.175 },
  { id: "pl-nusa-dua", slug: "nusa-dua", islandSlug: "bali", lat: -8.8009, lng: 115.2324 },
  { id: "pl-lovina", slug: "lovina", islandSlug: "bali", lat: -8.1586, lng: 115.0263 },
  { id: "pl-amed", slug: "amed", islandSlug: "bali", lat: -8.3333, lng: 115.6333 },
  { id: "pl-yogya", slug: "yogyakarta", islandSlug: "java", lat: -7.7956, lng: 110.3695 },
  { id: "pl-bandung", slug: "bandung", islandSlug: "java", lat: -6.9175, lng: 107.6191 },
  { id: "pl-jakarta", slug: "jakarta", islandSlug: "java", lat: -6.2088, lng: 106.8456 },
  { id: "pl-surabaya", slug: "surabaya", islandSlug: "java", lat: -7.2575, lng: 112.7521 },
  { id: "pl-lombok-utara", slug: "lombok-utara", islandSlug: "lombok", lat: -8.3481, lng: 116.2733 },
  { id: "pl-lombok-tengah", slug: "lombok-tengah", islandSlug: "lombok", lat: -8.705, lng: 116.2767 },
  { id: "pl-gili-t", slug: "gili-trawangan", islandSlug: "lombok", lat: -8.3519, lng: 116.0369 },
  { id: "pl-kuta-lombok", slug: "kuta", islandSlug: "lombok", lat: -8.8956, lng: 116.2803 },
  { id: "pl-medan", slug: "medan", islandSlug: "sumatra", lat: 3.5952, lng: 98.6722 },
  { id: "pl-makassar", slug: "makassar", islandSlug: "sulawesi", lat: -5.1477, lng: 119.4327 },
];

export const ISLAND_CENTROIDS = {
  bali: { lat: -8.4095, lng: 115.1889 },
  java: { lat: -7.6145, lng: 110.7122 },
  lombok: { lat: -8.65, lng: 116.3249 },
  sumatra: { lat: 0.5897, lng: 101.3431 },
  sulawesi: { lat: -2.0, lng: 120.0 },
  kalimantan: { lat: -0.5, lng: 113.9 },
  maluku: { lat: -3.2385, lng: 130.1453 },
  papua: { lat: -4.2699, lng: 138.0804 },
};

export const INDONESIA_CENTROID = { lat: -2.5489, lng: 118.0149 };

export const DEFAULT_STORE = "/opt/nusa.business/.data/store.json";
export const DEFAULT_BACKUP_DIR = "/var/backups/nusa";

export function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

export function hasCoords(row) {
  return (
    Number.isFinite(row?.lat) &&
    Number.isFinite(row?.lng) &&
    !(row.lat === 0 && row.lng === 0)
  );
}

export function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6_371_000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Deterministic offset 50–150 m so centroid pins do not stack, still well
 * inside the 2 km similar-business radius.
 */
export function jitterAround(seed, lat, lng, minM = 50, maxM = 150) {
  const h = fnv1a(seed);
  const span = maxM - minM + 1;
  const meters = minM + (h % span);
  const bearing = (((h >>> 10) % 360) * Math.PI) / 180;
  const dLat = (meters * Math.cos(bearing)) / 111_320;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = (meters * Math.sin(bearing)) / (111_320 * Math.max(0.2, Math.abs(cosLat)));
  return {
    lat: round6(lat + dLat),
    lng: round6(lng + dLng),
    jitterMeters: meters,
  };
}

export function backupPathFor(targetPath) {
  return `${targetPath}.bak`;
}

/** Same crash-safe replace as packages/db/src/persist.ts (inlined, no package import). */
export function atomicWriteFile(targetPath, contents, opts = {}) {
  const rotateBackup = opts.rotateBackup !== false;
  const dir = dirname(targetPath);
  mkdirSync(dir, { recursive: true });

  const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  const fd = openSync(tmpPath, "w");
  try {
    const buffer = Buffer.from(contents, "utf8");
    let offset = 0;
    while (offset < buffer.length) {
      const written = writeSync(fd, buffer, offset, buffer.length - offset, null);
      if (written === 0) {
        throw new Error("Unable to write store file: writeSync made no progress");
      }
      offset += written;
    }
    fsyncSync(fd);
  } catch (err) {
    try {
      closeSync(fd);
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
    throw err;
  }
  closeSync(fd);

  try {
    if (rotateBackup && existsSync(targetPath)) {
      copyFileSync(targetPath, backupPathFor(targetPath));
    }
    renameSync(tmpPath, targetPath);
  } catch (err) {
    try {
      unlinkSync(tmpPath);
    } catch {
      /* ignore */
    }
    throw err;
  }

  try {
    const dirFd = openSync(dir, "r");
    try {
      fsyncSync(dirFd);
    } finally {
      closeSync(dirFd);
    }
  } catch {
    /* directory fsync is best-effort */
  }
}

export function utcBackupStamp(date = new Date()) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d+Z$/, "Z");
}

export function timestampedBackupPath(backupDir, date) {
  return `${backupDir.replace(/\/$/, "")}/store.json.${utcBackupStamp(date)}`;
}

/**
 * Pull id/slug/placeId/lat/lng out of seed-data.ts biz({...}) blocks without
 * compiling TypeScript.
 */
export function parseSeedListingCoords(source) {
  const listings = [];
  const starts = [...String(source).matchAll(/biz\(\s*\{/g)];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : source.length;
    const block = source.slice(start, end);
    const id = block.match(/\bid:\s*"([^"]+)"/)?.[1];
    const slug = block.match(/\bslug:\s*"([^"]+)"/)?.[1];
    const placeId = block.match(/\bplaceId:\s*"([^"]+)"/)?.[1];
    const latRaw = block.match(/\blat:\s*(-?\d+(?:\.\d+)?)/);
    const lngRaw = block.match(/\blng:\s*(-?\d+(?:\.\d+)?)/);
    if (!id || !slug) continue;
    const lat = latRaw ? Number(latRaw[1]) : undefined;
    const lng = lngRaw ? Number(lngRaw[1]) : undefined;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    listings.push({ id, slug, placeId, lat, lng });
  }
  return listings;
}

export function loadSeedCoords(seedPath) {
  const merged = [...EMBEDDED_SEED_COORDS];
  if (!seedPath || !existsSync(seedPath)) return merged;
  const parsed = parseSeedListingCoords(readFileSync(seedPath, "utf8"));
  const byId = new Map(merged.map((r) => [r.id, r]));
  for (const row of parsed) {
    byId.set(row.id, row);
  }
  return [...byId.values()];
}

function indexSeed(rows) {
  const byId = new Map();
  const byPlaceSlug = new Map();
  const bySlug = new Map();
  for (const row of rows) {
    byId.set(row.id, row);
    if (row.placeId && row.slug) {
      byPlaceSlug.set(`${row.placeId}:${row.slug}`, row);
    }
    if (row.slug && !bySlug.has(row.slug)) bySlug.set(row.slug, row);
  }
  return { byId, byPlaceSlug, bySlug };
}

function indexPlaces(centroids) {
  const byId = new Map();
  const byIslandSlug = new Map();
  const bySlug = new Map();
  for (const row of centroids) {
    if (row.id) byId.set(row.id, row);
    if (row.islandSlug && row.slug) {
      byIslandSlug.set(`${row.islandSlug}:${row.slug}`, row);
    }
    if (row.slug && !bySlug.has(row.slug)) bySlug.set(row.slug, row);
  }
  return { byId, byIslandSlug, bySlug };
}

function islandSlugOf(place, islandsById) {
  if (!place) return undefined;
  return islandsById.get(place.islandId)?.slug;
}

export function resolveListingCoords(biz, ctx) {
  const { seed, places, islandsById } = ctx;
  const seedHit =
    seed.byId.get(biz.id) ||
    (biz.placeId && biz.slug
      ? seed.byPlaceSlug.get(`${biz.placeId}:${biz.slug}`)
      : undefined) ||
    (biz.slug ? seed.bySlug.get(biz.slug) : undefined);
  if (seedHit && hasCoords(seedHit)) {
    return {
      lat: seedHit.lat,
      lng: seedHit.lng,
      source: seed.byId.get(biz.id) ? "seed-id" : "seed-slug",
    };
  }

  const place = biz.placeId ? places.storeById.get(biz.placeId) : undefined;
  const islandSlug = islandSlugOf(place, islandsById);
  // Never key a centroid by place slug alone — `kuta` is Bali and Lombok.
  const centroid =
    (biz.placeId && ctx.centroids.byId.get(biz.placeId)) ||
    (place && ctx.centroids.byId.get(place.id)) ||
    (islandSlug && place
      ? ctx.centroids.byIslandSlug.get(`${islandSlug}:${place.slug}`)
      : undefined);

  if (centroid && hasCoords(centroid)) {
    const jittered = jitterAround(biz.id || biz.slug, centroid.lat, centroid.lng);
    return {
      lat: jittered.lat,
      lng: jittered.lng,
      source: "place-centroid",
      jitterMeters: jittered.jitterMeters,
    };
  }

  const island = islandSlug && ISLAND_CENTROIDS[islandSlug];
  const fallback = island || INDONESIA_CENTROID;
  const jittered = jitterAround(biz.id || biz.slug, fallback.lat, fallback.lng);
  return {
    lat: jittered.lat,
    lng: jittered.lng,
    source: island ? "island-centroid" : "nation-centroid",
    jitterMeters: jittered.jitterMeters,
  };
}

export function lookupSeedCoords(business, seedRows = EMBEDDED_SEED_COORDS) {
  const seed = indexSeed(seedRows);
  return (
    seed.byId.get(business.id) ||
    (business.placeId && business.slug
      ? seed.byPlaceSlug.get(`${business.placeId}:${business.slug}`)
      : undefined) ||
    (business.slug ? seed.bySlug.get(business.slug) : undefined) ||
    null
  );
}

export function coordsContext(store, opts = {}) {
  return {
    seed: indexSeed(opts.seedRows ?? loadSeedCoords(opts.seedPath)),
    centroids: indexPlaces(opts.centroids ?? PLACE_CENTROIDS),
    places: { storeById: new Map((store.places ?? []).map((p) => [p.id, p])) },
    islandsById: new Map((store.islands ?? []).map((i) => [i.id, i])),
  };
}

export function resolveCoords(business, store, opts = {}) {
  return resolveListingCoords(business, coordsContext(store, opts));
}

export function backfillStore(store, opts = {}) {
  const force = Boolean(opts.force);
  const seedRows = opts.seedRows ?? loadSeedCoords(opts.seedPath);
  const seed = indexSeed(seedRows);
  const centroids = indexPlaces(opts.centroids ?? PLACE_CENTROIDS);
  const storeById = new Map((store.places ?? []).map((p) => [p.id, p]));
  const islandsById = new Map((store.islands ?? []).map((i) => [i.id, i]));
  const ctx = { seed, centroids, places: { storeById }, islandsById };
  const now = opts.now ?? new Date().toISOString();

  const changes = [];
  const skipped = [];
  const businesses = store.businesses ?? [];

  for (const biz of businesses) {
    if (hasCoords(biz) && !force) {
      skipped.push({ id: biz.id, slug: biz.slug, reason: "already-set" });
      continue;
    }
    const next = resolveListingCoords(biz, ctx);
    const previous = hasCoords(biz) ? { lat: biz.lat, lng: biz.lng } : null;
    biz.lat = next.lat;
    biz.lng = next.lng;
    biz.updatedAt = now;
    changes.push({
      id: biz.id,
      slug: biz.slug,
      source: next.source,
      lat: next.lat,
      lng: next.lng,
      previous,
      jitterMeters: next.jitterMeters,
    });
  }

  const missing = businesses.filter((b) => !hasCoords(b));
  return {
    store,
    changes,
    skipped,
    total: businesses.length,
    filled: changes.length,
    alreadySet: skipped.length,
    stillMissing: missing.length,
  };
}

export function parseArgs(argv) {
  const out = {
    store: undefined,
    backupDir: DEFAULT_BACKUP_DIR,
    seed: undefined,
    force: false,
    dryRun: false,
    skipBackup: false,
    help: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--store") out.store = argv[++i];
    else if (a.startsWith("--store=")) out.store = a.slice("--store=".length);
    else if (a === "--backup-dir") out.backupDir = argv[++i];
    else if (a === "--seed") out.seed = argv[++i];
    else if (a === "--force") out.force = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--skip-backup") out.skipBackup = true;
    else if (a === "-h" || a === "--help") out.help = true;
    else if (a.startsWith("-")) {
      throw new Error(`Unknown flag: ${a}`);
    }
  }
  return out;
}

export function defaultStorePath() {
  if (process.env.NUSA_DATA_DIR) {
    return resolve(process.env.NUSA_DATA_DIR, "store.json");
  }
  return DEFAULT_STORE;
}

export function detectSeedPath(explicit, cwd = process.cwd()) {
  if (explicit) return isAbsolute(explicit) ? explicit : resolve(cwd, explicit);
  const candidates = [
    resolve(cwd, "packages/db/src/seed-data.ts"),
    "/opt/nusa.business/packages/db/src/seed-data.ts",
  ];
  try {
    candidates.unshift(
      resolve(fileURLToPath(import.meta.url), "../../packages/db/src/seed-data.ts"),
    );
  } catch {
    /* stdin / piped module */
  }
  return candidates.find((p) => existsSync(p));
}

export function writeTimestampedBackup(storePath, backupDir) {
  mkdirSync(backupDir, { recursive: true });
  const dest = timestampedBackupPath(backupDir);
  copyFileSync(storePath, dest);
  return dest;
}

export function summaryJson(result, extra = {}) {
  const bySource = {};
  for (const c of result.changes) {
    bySource[c.source] = (bySource[c.source] ?? 0) + 1;
  }
  return {
    store: extra.store ?? null,
    dryRun: Boolean(extra.dryRun),
    force: Boolean(extra.force),
    backup: extra.backup ?? result.backup ?? null,
    total: result.total,
    filled: result.filled,
    alreadySet: result.alreadySet,
    stillMissing: result.stillMissing,
    sources: bySource,
  };
}

export function printSummary(result, extra = {}) {
  return `${JSON.stringify(summaryJson(result, extra))}\n`;
}

export function runBackfill(opts) {
  const storePath = opts.store;
  if (!storePath) throw new Error("Missing --store path");
  if (!existsSync(storePath)) {
    throw new Error(`Store not found: ${storePath}`);
  }
  const raw = readFileSync(storePath, "utf8");
  let store;
  try {
    store = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Unreadable store JSON: ${storePath} (${err.message})`);
  }
  if (!Array.isArray(store.businesses)) {
    throw new Error("store.businesses is missing or not an array");
  }

  const result = backfillStore(store, {
    force: opts.force,
    seedPath: opts.seed,
  });

  if (opts.dryRun) {
    return { ...result, wrote: false, backup: null };
  }

  let backup = null;
  if (!opts.skipBackup) {
    backup = writeTimestampedBackup(storePath, opts.backupDir);
  }

  atomicWriteFile(storePath, `${JSON.stringify(store, null, 2)}\n`);
  return { ...result, wrote: true, backup };
}

export const HELP = `Fill missing listing lat/lng so similar-within-2km discovery works.

Usage:
  node scripts/backfill-listing-coords.mjs --store PATH [options]

Options:
  --store PATH       Path to store.json
  --backup-dir DIR   Timestamped copy before write (default: ${DEFAULT_BACKUP_DIR})
  --seed PATH        Optional seed-data.ts to merge coords from (no @nusa/db)
  --force            Overwrite listings that already have coordinates
  --dry-run          Print the plan; do not write
  --skip-backup      Skip timestamped backup (atomic .bak still written)
  -h, --help

Does not re-seed the store. Only sets lat/lng. Does not require a rebuilt
@nusa/db. getStore() re-reads store.json per request; optional: pm2 reload api.
`;

export async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) {
    process.stdout.write(HELP);
    return 0;
  }
  const store = args.store || defaultStorePath();
  const seed = detectSeedPath(args.seed);
  const result = runBackfill({
    store,
    backupDir: args.backupDir,
    seed,
    force: args.force,
    dryRun: args.dryRun,
    skipBackup: args.skipBackup,
  });
  process.stdout.write(
    printSummary(result, {
      backup: result.backup,
      store,
      dryRun: args.dryRun,
      force: args.force,
    }),
  );
  if (result.stillMissing) {
    process.stderr.write(
      `error: ${result.stillMissing} listing(s) still lack coordinates\n`,
    );
    return 1;
  }
  return 0;
}

function isDirectRun() {
  const arg = process.argv[1];
  if (!arg) return false;
  if (arg === "-" || arg === "/dev/stdin") return true;
  try {
    return resolve(arg) === fileURLToPath(import.meta.url);
  } catch {
    return /backfill-listing-coords/.test(arg);
  }
}

if (isDirectRun()) {
  main()
    .then((code) => {
      if (typeof code === "number" && code !== 0) process.exitCode = code;
    })
    .catch((err) => {
      process.stderr.write(`${err.message || err}\n`);
      process.exitCode = 1;
    });
}
