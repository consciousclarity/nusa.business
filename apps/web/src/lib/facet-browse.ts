import {
  applyFacetQuery,
  parseFacetPath,
  promoteIndexablePath,
  type FacetBrowse,
} from "@nusa/shared";

export function resolveFacetBrowse(
  segments: string[],
  search: URLSearchParams,
):
  | { ok: false; error: string }
  | { ok: true; browse: FacetBrowse; promoted: FacetBrowse | null } {
  const parsed = parseFacetPath(segments);
  if (!parsed.ok) return parsed;
  const browse = applyFacetQuery(parsed.browse, search);
  return { ok: true, browse, promoted: promoteIndexablePath(browse) };
}

export function searchQueryForBrowse(
  island: string,
  place: string | undefined,
  browse: FacetBrowse,
): string {
  const params = new URLSearchParams();
  params.set("island", island);
  if (place) params.set("place", place);
  params.set("category", browse.category);
  for (const [key, values] of Object.entries(browse.selected)) {
    for (const v of values) params.append(key, v);
  }
  return params.toString();
}
