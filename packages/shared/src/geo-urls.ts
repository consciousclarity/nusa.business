/** Place fields needed to decide host vs path. */
export type NestablePlace = {
  id: string;
  slug: string;
  type: "kabupaten" | "kota" | "tourist_area";
  parentPlaceId?: string;
};

export type GeoNesting = {
  /** Kabupaten/kota (or orphan tourist area) that owns the host label. */
  hostPlace: string;
  /** Tourist-area slug under that host, when nested. */
  area?: string;
};

function asPlaceMap(
  byId: ReadonlyMap<string, NestablePlace> | Record<string, NestablePlace>,
): ReadonlyMap<string, NestablePlace> {
  if (byId instanceof Map) return byId;
  return new Map(Object.entries(byId));
}

function isAdminPlace(type: NestablePlace["type"]): boolean {
  return type === "kabupaten" || type === "kota";
}

/**
 * Global public URL rule: host is the administrative parent; nested
 * tourist areas are one path segment.
 *
 *   ubud + parent gianyar → { hostPlace: "gianyar", area: "ubud" }
 *   gianyar kabupaten     → { hostPlace: "gianyar" }
 *
 * Orphan tourist areas (no kabupaten/kota parent) keep their own host.
 * Nesting is one level — a tourist area under another tourist area is not
 * encoded in the URL.
 */
export function geoNesting(
  place: NestablePlace,
  byId: ReadonlyMap<string, NestablePlace> | Record<string, NestablePlace>,
): GeoNesting {
  if (place.type !== "tourist_area" || !place.parentPlaceId) {
    return { hostPlace: place.slug };
  }
  const parent = asPlaceMap(byId).get(place.parentPlaceId);
  if (!parent || !isAdminPlace(parent.type)) {
    return { hostPlace: place.slug };
  }
  return { hostPlace: parent.slug, area: place.slug };
}

/** Hostname + path line shown in portals and the listing "Host" field. */
export function publicHostLine(opts: {
  island: string;
  place: string;
  area?: string;
  slug?: string;
}): string {
  const host = `${opts.place}.${opts.island}.nusa.business`;
  const segs = [opts.area, opts.slug].filter(Boolean);
  return segs.length ? `${host}/${segs.join("/")}` : host;
}
