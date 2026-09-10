export type DirectoryMapMarker = {
  lat: number;
  lng: number;
  name: string;
  href?: string;
  kind?: "listing" | "place";
};

const MAX_MARKERS = 80;

export function hasCoords(
  row: { lat?: number; lng?: number } | null | undefined,
): boolean {
  return (
    Number.isFinite(row?.lat) &&
    Number.isFinite(row?.lng) &&
    !(row!.lat === 0 && row!.lng === 0)
  );
}

export function listingMarker(opts: {
  lat?: number;
  lng?: number;
  name: string;
  href?: string;
}): DirectoryMapMarker | null {
  if (!hasCoords(opts)) return null;
  return {
    lat: opts.lat as number,
    lng: opts.lng as number,
    name: opts.name,
    href: opts.href,
    kind: "listing",
  };
}

export function placeMarker(opts: {
  lat: number;
  lng: number;
  name: string;
  href: string;
}): DirectoryMapMarker {
  return { ...opts, kind: "place" };
}

export function takeMarkers(markers: Array<DirectoryMapMarker | null>): DirectoryMapMarker[] {
  return markers.filter((m): m is DirectoryMapMarker => m !== null).slice(0, MAX_MARKERS);
}
