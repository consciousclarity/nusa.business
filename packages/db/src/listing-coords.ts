import type { DataStore, Island, Place } from "./types.js";
import { createSeed } from "./seed-data.js";

/**
 * Fill missing listing lat/lng on an already-persisted store.
 *
 * Production `store.json` is seeded once. Listings that landed without
 * coordinates (live Ibu Oka returned `origin: null`) never pick up pins from
 * later seed-data.ts edits, so the listing nearby map stays omitted.
 *
 * Match order mirrors `scripts/backfill-listing-coords.mjs`: seed by id, then
 * placeId:slug, then slug; otherwise jitter around a place/island centroid.
 */

const ISLAND_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  bali: { lat: -8.4095, lng: 115.1889 },
  java: { lat: -7.6145, lng: 110.7122 },
  lombok: { lat: -8.65, lng: 116.3249 },
  sumatra: { lat: 0.5897, lng: 101.3431 },
  sulawesi: { lat: -2.0, lng: 120.0 },
  kalimantan: { lat: -0.5, lng: 113.9 },
  maluku: { lat: -3.2385, lng: 130.1453 },
  papua: { lat: -4.2699, lng: 138.0804 },
};

const INDONESIA_CENTROID = { lat: -2.5489, lng: 118.0149 };

export function hasListingCoords(
  row: { lat?: number; lng?: number } | null | undefined,
): boolean {
  return (
    Number.isFinite(row?.lat) &&
    Number.isFinite(row?.lng) &&
    !(row!.lat === 0 && row!.lng === 0)
  );
}

function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

function fnv1a(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function jitterAround(
  seed: string,
  lat: number,
  lng: number,
  minM = 50,
  maxM = 150,
): { lat: number; lng: number } {
  const h = fnv1a(seed);
  const span = maxM - minM + 1;
  const meters = minM + (h % span);
  const bearing = (((h >>> 10) % 360) * Math.PI) / 180;
  const dLat = (meters * Math.cos(bearing)) / 111_320;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng =
    (meters * Math.sin(bearing)) /
    (111_320 * Math.max(0.2, Math.abs(cosLat)));
  return { lat: round6(lat + dLat), lng: round6(lng + dLng) };
}

type SeedPin = { id: string; slug: string; placeId: string; lat: number; lng: number };

function seedPins(seed: DataStore): SeedPin[] {
  return seed.businesses
    .filter((b) => hasListingCoords(b) && b.placeId)
    .map((b) => ({
      id: b.id,
      slug: b.slug,
      placeId: b.placeId,
      lat: b.lat as number,
      lng: b.lng as number,
    }));
}

function averagePins(pins: SeedPin[]): { lat: number; lng: number } {
  const lat = pins.reduce((s, p) => s + p.lat, 0) / pins.length;
  const lng = pins.reduce((s, p) => s + p.lng, 0) / pins.length;
  return { lat: round6(lat), lng: round6(lng) };
}

function islandSlugOf(
  place: Place | undefined,
  islandsById: Map<string, Island>,
): string | undefined {
  if (!place) return undefined;
  return islandsById.get(place.islandId)?.slug;
}

export function backfillListingCoords(store: DataStore, now = new Date().toISOString()): boolean {
  const seed = createSeed();
  const pins = seedPins(seed);
  const byId = new Map(pins.map((p) => [p.id, p]));
  const byPlaceSlug = new Map(pins.map((p) => [`${p.placeId}:${p.slug}`, p]));
  const bySlug = new Map<string, SeedPin>();
  for (const p of pins) {
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, p);
  }

  const pinsByPlaceId = new Map<string, SeedPin[]>();
  const pinsByIslandSlug = new Map<string, SeedPin[]>();
  const seedPlacesById = new Map(seed.places.map((p) => [p.id, p]));
  const seedIslandsById = new Map(seed.islands.map((i) => [i.id, i]));
  for (const pin of pins) {
    const list = pinsByPlaceId.get(pin.placeId) ?? [];
    list.push(pin);
    pinsByPlaceId.set(pin.placeId, list);
    const place = seedPlacesById.get(pin.placeId);
    const islandSlug = islandSlugOf(place, seedIslandsById);
    if (place && islandSlug) {
      const key = `${islandSlug}:${place.slug}`;
      const grouped = pinsByIslandSlug.get(key) ?? [];
      grouped.push(pin);
      pinsByIslandSlug.set(key, grouped);
    }
  }

  const storePlacesById = new Map((store.places ?? []).map((p) => [p.id, p]));
  const storeIslandsById = new Map((store.islands ?? []).map((i) => [i.id, i]));

  let changed = false;
  for (const biz of store.businesses ?? []) {
    if (hasListingCoords(biz)) continue;
    const seedHit =
      byId.get(biz.id) ||
      (biz.placeId && biz.slug
        ? byPlaceSlug.get(`${biz.placeId}:${biz.slug}`)
        : undefined) ||
      (biz.slug ? bySlug.get(biz.slug) : undefined);

    let lat: number;
    let lng: number;
    if (seedHit) {
      lat = seedHit.lat;
      lng = seedHit.lng;
    } else {
      const place = biz.placeId ? storePlacesById.get(biz.placeId) : undefined;
      const islandSlug = islandSlugOf(place, storeIslandsById);
      const placePins =
        (biz.placeId ? pinsByPlaceId.get(biz.placeId) : undefined) ||
        (islandSlug && place
          ? pinsByIslandSlug.get(`${islandSlug}:${place.slug}`)
          : undefined);
      const centroid = placePins?.length
        ? averagePins(placePins)
        : islandSlug && ISLAND_CENTROIDS[islandSlug]
          ? ISLAND_CENTROIDS[islandSlug]
          : INDONESIA_CENTROID;
      const jittered = jitterAround(biz.id || biz.slug, centroid.lat, centroid.lng);
      lat = jittered.lat;
      lng = jittered.lng;
    }

    biz.lat = lat;
    biz.lng = lng;
    biz.updatedAt = now;
    changed = true;
  }
  return changed;
}
