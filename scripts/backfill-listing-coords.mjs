#!/usr/bin/env node
/**
 * Fill missing lat/lng on businesses in a JSON store.
 *
 * Standalone (no @nusa/db import) so Warden can run it on a stale VPS checkout.
 * Default: fill-missing only. Use --force to overwrite existing coords.
 *
 *   node scripts/backfill-listing-coords.mjs --store /opt/nusa.business/.data/store.json
 *   node scripts/backfill-listing-coords.mjs --store PATH --dry-run
 *   node scripts/backfill-listing-coords.mjs --store PATH --force
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
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/** Seed listing pins (id → [lat, lng]). Exact values; no jitter. */
export const SEED_COORDS_BY_ID = {
  "biz-single-fin": [-8.8291, 115.0849],
  "biz-kecak": [-8.8295, 115.0845],
  "biz-alchemy": [-8.821, 115.088],
  "biz-menega": [-8.784, 115.163],
  "biz-pande-egi": [-8.5439, 115.325],
  "biz-kopi-rai": [-8.5439, 115.325],
  "biz-celuk": [-8.5485, 115.318],
  "biz-batik-g": [-8.5412, 115.331],
  "biz-warung-pasar": [-8.5455, 115.3275],
  "biz-bpr-gianyar": [-8.5448, 115.3262],
  "biz-klinik-g": [-8.54, 115.329],
  "biz-gianyar-weddings": [-8.542, 115.328],
  "biz-gianyar-catering": [-8.543, 115.327],
  "biz-ibu-oka": [-8.5069, 115.2625],
  "biz-yoga-barn": [-8.5195, 115.265],
  "biz-monkey-cafe": [-8.5188, 115.2594],
  "biz-nusa-dua-beach": [-8.8009, 115.2324],
  "biz-canggu-scooter": [-8.6478, 115.1385],
  "biz-denpasar-halal": [-8.6724, 115.2126],
};

/** Seed listing pins (slug → [lat, lng]) when live rows kept the slug but not the id. */
export const SEED_COORDS_BY_SLUG = {
  "single-fin-uluwatu": [-8.8291, 115.0849],
  "uluwatu-temple-kecak": [-8.8295, 115.0845],
  "alchemy-uluwatu": [-8.821, 115.088],
  "menega-cafe": [-8.784, 115.163],
  "babi-guling-pande-egi": [-8.5439, 115.325],
  "kopi-ngurah-rai": [-8.5439, 115.325],
  "celuk-silver-workshop": [-8.5485, 115.318],
  "batik-gianyar-gallery": [-8.5412, 115.331],
  "warung-pasar-gianyar": [-8.5455, 115.3275],
  "bpr-gianyar-pusat": [-8.5448, 115.3262],
  "klinik-sehat-gianyar": [-8.54, 115.329],
  "gianyar-wedding-organizer": [-8.542, 115.328],
  "ibu-made-catering": [-8.543, 115.327],
  "warung-babi-guling-ibu-oka": [-8.5069, 115.2625],
  "yoga-barn-ubud": [-8.5195, 115.265],
  "sacred-monkey-forest-cafe": [-8.5188, 115.2594],
  "nusa-dua-beach-hotel": [-8.8009, 115.2324],
  "canggu-scooter-rental": [-8.6478, 115.1385],
  "rumah-makan-halal-denpasar": [-8.6724, 115.2126],
};

/** Place centroids keyed by seed place id. */
export const PLACE_CENTROIDS_BY_ID = {
  "pl-badung": [-8.672, 115.155],
  "pl-gianyar": [-8.544, 115.325],
  "pl-denpasar": [-8.6724, 115.2126],
  "pl-buleleng": [-8.192, 115.095],
  "pl-karangasem": [-8.446, 115.612],
  "pl-uluwatu": [-8.829, 115.085],
  "pl-jimbaran": [-8.784, 115.163],
  "pl-ubud": [-8.5069, 115.2625],
  "pl-canggu": [-8.648, 115.138],
  "pl-seminyak": [-8.691, 115.157],
  "pl-sanur": [-8.688, 115.262],
  "pl-kuta": [-8.718, 115.169],
  "pl-nusa-dua": [-8.801, 115.232],
  "pl-lovina": [-8.159, 115.026],
  "pl-amed": [-8.333, 115.662],
  "pl-yogya": [-7.7956, 110.3695],
  "pl-bandung": [-6.9175, 107.6191],
  "pl-jakarta": [-6.2088, 106.8456],
  "pl-surabaya": [-7.2575, 112.7521],
  "pl-lombok-utara": [-8.352, 116.243],
  "pl-lombok-tengah": [-8.705, 116.275],
  "pl-gili-t": [-8.351, 116.043],
  "pl-kuta-lombok": [-8.896, 116.279],
  "pl-medan": [3.5952, 98.6722],
  "pl-makassar": [-5.1477, 119.4327],
};

/**
 * Place centroids keyed by `islandSlug:placeSlug`.
 * `kuta` exists on Bali (Badung) and Lombok — never key by slug alone.
 */
export const PLACE_CENTROIDS_BY_ISLAND_SLUG = {
  "bali:badung": [-8.672, 115.155],
  "bali:gianyar": [-8.544, 115.325],
  "bali:denpasar": [-8.6724, 115.2126],
  "bali:buleleng": [-8.192, 115.095],
  "bali:karangasem": [-8.446, 115.612],
  "bali:uluwatu": [-8.829, 115.085],
  "bali:jimbaran": [-8.784, 115.163],
  "bali:ubud": [-8.5069, 115.2625],
  "bali:canggu": [-8.648, 115.138],
  "bali:seminyak": [-8.691, 115.157],
  "bali:sanur": [-8.688, 115.262],
  "bali:kuta": [-8.718, 115.169],
  "bali:nusa-dua": [-8.801, 115.232],
  "bali:lovina": [-8.159, 115.026],
  "bali:amed": [-8.333, 115.662],
  "java:yogyakarta": [-7.7956, 110.3695],
  "java:bandung": [-6.9175, 107.6191],
  "java:jakarta": [-6.2088, 106.8456],
  "java:surabaya": [-7.2575, 112.7521],
  "lombok:lombok-utara": [-8.352, 116.243],
  "lombok:lombok-tengah": [-8.705, 116.275],
  "lombok:gili-trawangan": [-8.351, 116.043],
  "lombok:kuta": [-8.896, 116.279],
  "sumatra:medan": [3.5952, 98.6722],
  "sulawesi:makassar": [-5.1477, 119.4327],
};

export const ISLAND_CENTROIDS = {
  bali: [-8.4095, 115.1889],
  java: [-7.6145, 110.7122],
  lombok: [-8.65, 116.32],
  sumatra: [0.589, 101.343],
  sulawesi: [-2.0, 120.8],
  kalimantan: [0.5, 114.0],
  maluku: [-3.2, 129.0],
  papua: [-4.3, 138.0],
};

export const INDONESIA_FALLBACK = [-2.5, 118.0];

export function hasCoords(business) {
  return (
    Number.isFinite(business?.lat) &&
    Number.isFinite(business?.lng) &&
    !(business.lat === 0 && business.lng === 0)
  );
}

function fnv1a(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(str) {
  return fnv1a(str) / 4294967296;
}

function round6(n) {
  return Math.round(n * 1e6) / 1e6;
}

/** Deterministic 50–150 m offset so centroid pins do not stack. */
export function jitterAround(lat, lng, salt) {
  const meters = 50 + unit(`${salt}:r`) * 100;
  const bearing = unit(`${salt}:b`) * Math.PI * 2;
  const dLat = (meters * Math.cos(bearing)) / 111_320;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const metersPerDegLng = 111_320 * Math.max(0.2, Math.abs(cosLat));
  const dLng = (meters * Math.sin(bearing)) / metersPerDegLng;
  return { lat: round6(lat + dLat), lng: round6(lng + dLng) };
}

function pair(entry) {
  if (!entry) return null;
  const [lat, lng] = entry;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function lookupSeedCoords(business) {
  return pair(SEED_COORDS_BY_ID[business.id]) ?? pair(SEED_COORDS_BY_SLUG[business.slug]);
}

export function lookupPlaceCentroid(business, store) {
  const places = Array.isArray(store?.places) ? store.places : [];
  const islands = Array.isArray(store?.islands) ? store.islands : [];
  const place = places.find((p) => p.id === business.placeId);
  if (!place) return null;
  const byId = pair(PLACE_CENTROIDS_BY_ID[place.id]);
  if (byId) return byId;
  const island = islands.find((i) => i.id === place.islandId);
  const islandSlug = island?.slug;
  if (islandSlug && place.slug) {
    return pair(PLACE_CENTROIDS_BY_ISLAND_SLUG[`${islandSlug}:${place.slug}`]);
  }
  return null;
}

export function lookupIslandCentroid(business, store) {
  const places = Array.isArray(store?.places) ? store.places : [];
  const islands = Array.isArray(store?.islands) ? store.islands : [];
  const place = places.find((p) => p.id === business.placeId);
  if (!place) return null;
  const island = islands.find((i) => i.id === place.islandId);
  return pair(ISLAND_CENTROIDS[island?.slug]);
}

export function resolveCoords(business, store) {
  const seed = lookupSeedCoords(business);
  if (seed) return { ...seed, source: "seed", jitter: false };
  const place = lookupPlaceCentroid(business, store);
  if (place) return { ...place, source: "place", jitter: true };
  const island = lookupIslandCentroid(business, store);
  if (island) return { ...island, source: "island", jitter: true };
  return { lat: INDONESIA_FALLBACK[0], lng: INDONESIA_FALLBACK[1], source: "fallback", jitter: true };
}

export function applyCoords(business, resolved) {
  const pin = resolved.jitter
    ? jitterAround(resolved.lat, resolved.lng, business.id || business.slug || "listing")
    : { lat: round6(resolved.lat), lng: round6(resolved.lng) };
  return { ...business, lat: pin.lat, lng: pin.lng };
}

export function backfillListingCoords(store, opts = {}) {
  const force = Boolean(opts.force);
  const businesses = Array.isArray(store?.businesses) ? store.businesses : [];
  const summary = {
    total: businesses.length,
    alreadyHad: 0,
    filledFromSeed: 0,
    filledFromPlace: 0,
    filledFromIsland: 0,
    filledFromFallback: 0,
    overwritten: 0,
    remaining: 0,
  };
  const next = businesses.map((business) => {
    if (hasCoords(business) && !force) {
      summary.alreadyHad += 1;
      return business;
    }
    const had = hasCoords(business);
    const resolved = resolveCoords(business, store);
    if (resolved.source === "seed") summary.filledFromSeed += 1;
    else if (resolved.source === "place") summary.filledFromPlace += 1;
    else if (resolved.source === "island") summary.filledFromIsland += 1;
    else summary.filledFromFallback += 1;
    if (had && force) summary.overwritten += 1;
    return applyCoords(business, resolved);
  });
  summary.remaining = next.filter((b) => !hasCoords(b)).length;
  return {
    store: { ...store, businesses: next },
    summary,
  };
}

export function backupPathFor(targetPath) {
  return `${targetPath}.bak`;
}

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

function parseArgs(argv) {
  const out = { store: "", dryRun: false, force: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--force") out.force = true;
    else if (arg === "--store") {
      out.store = argv[i + 1] ?? "";
      i += 1;
    } else if (arg.startsWith("--store=")) {
      out.store = arg.slice("--store=".length);
    }
  }
  return out;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (!args.store) {
    console.error(
      "Usage: node scripts/backfill-listing-coords.mjs --store PATH [--dry-run] [--force]",
    );
    process.exitCode = 1;
    return;
  }
  const storePath = resolve(args.store);
  if (!existsSync(storePath)) {
    console.error(`store not found: ${storePath}`);
    process.exitCode = 1;
    return;
  }
  const store = JSON.parse(readFileSync(storePath, "utf8"));
  const { store: next, summary } = backfillListingCoords(store, { force: args.force });
  console.log(JSON.stringify({ store: storePath, dryRun: args.dryRun, force: args.force, ...summary }));
  if (args.dryRun) return;
  atomicWriteFile(storePath, `${JSON.stringify(next, null, 2)}\n`);
  if (summary.remaining !== 0) {
    console.error(`backfill incomplete: ${summary.remaining} listings still lack coordinates`);
    process.exitCode = 1;
  }
}

const isMain =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  main();
}
