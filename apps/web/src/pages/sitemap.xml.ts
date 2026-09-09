import type { APIRoute } from "astro";
import { api } from "../lib/api";
import {
  absoluteUrl,
  hostPath,
  localeSitemapPaths,
  sitemapXml,
} from "../lib/seo";
import {
  geoNesting,
  indexableBrowsePathsForListings,
  type NestablePlace,
} from "@nusa/shared";

type Island = { slug: string; status: string };
type Place = NestablePlace;
type Business = {
  slug: string;
  placeId: string;
  categories?: string[];
  facets?: Record<string, string[]>;
  status?: string;
  openingHours?: { day: string; open: string; close: string; closed?: boolean }[];
};

/**
 * Sitemap for the public directory. Local/dev emits /host/… paths on the
 * request origin; each loc is also emitted under `/id`. A single apex
 * sitemap stays crawlable until per-host sitemaps land.
 */
export const GET: APIRoute = async ({ request }) => {
  const urls = new Set<string>();

  const add = (path: string) => {
    for (const localized of localeSitemapPaths(path)) {
      urls.add(absoluteUrl(request, localized));
    }
  };

  add("/");
  add("/claim");
  add("/privacy");
  add("/terms");
  add("/support");

  try {
    const { islands } = await api<{ islands: Island[] }>("/v1/islands");
    for (const island of islands) {
      if (island.status !== "active") continue;
      add(hostPath({ island: island.slug }));

      const detail = await api<{
        places: Place[];
        businesses: Business[];
      }>(`/v1/islands/${island.slug}`);

      const byId = Object.fromEntries(detail.places.map((p) => [p.id, p]));
      const placeById = new Map(detail.places.map((p) => [p.id, p]));

      for (const place of detail.places) {
        const nest = geoNesting(place, byId);
        add(
          hostPath({
            island: island.slug,
            place: nest.hostPlace,
            area: nest.area,
          }),
        );
      }

      for (const biz of detail.businesses) {
        const place = placeById.get(biz.placeId);
        if (!place) continue;
        const nest = geoNesting(place, byId);
        add(
          hostPath({
            island: island.slug,
            place: nest.hostPlace,
            area: nest.area,
            slug: biz.slug,
          }),
        );
      }

      const islandPaths = indexableBrowsePathsForListings(detail.businesses);
      for (const row of islandPaths) {
        add(
          hostPath({
            island: island.slug,
            category: row.category,
            facet: row.facet,
            facetValue: row.facetValue,
          }),
        );
      }

      const byPlace = new Map<string, Business[]>();
      for (const biz of detail.businesses) {
        const list = byPlace.get(biz.placeId) ?? [];
        list.push(biz);
        byPlace.set(biz.placeId, list);
      }
      for (const place of detail.places) {
        const nest = geoNesting(place, byId);
        const rows = byPlace.get(place.id) ?? [];
        for (const row of indexableBrowsePathsForListings(rows)) {
          add(
            hostPath({
              island: island.slug,
              place: nest.hostPlace,
              area: nest.area,
              category: row.category,
              facet: row.facet,
              facetValue: row.facetValue,
            }),
          );
        }
      }
    }
  } catch {
    // Empty / partial sitemap is better than 500 for crawlers during API blips.
  }

  return new Response(sitemapXml([...urls]), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=900",
    },
  });
};
