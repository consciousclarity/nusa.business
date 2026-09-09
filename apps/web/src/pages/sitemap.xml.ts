import type { APIRoute } from "astro";
import { api } from "../lib/api";
import {
  absoluteUrl,
  hostPath,
  sitemapXml,
  siteOrigin,
} from "../lib/seo";
import { geoNesting, type NestablePlace } from "@nusa/shared";

type Island = { slug: string; status: string };
type Place = NestablePlace;
type Business = { slug: string; placeId: string };

/**
 * Sitemap for the public directory. Local/dev emits /host/… paths on the
 * request origin; a single apex sitemap stays crawlable until per-host
 * sitemaps land.
 */
export const GET: APIRoute = async ({ request }) => {
  const origin = siteOrigin(request);
  const urls = new Set<string>([`${origin}/`, absoluteUrl(request, "/claim")]);

  try {
    const { islands } = await api<{ islands: Island[] }>("/v1/islands");
    for (const island of islands) {
      if (island.status !== "active") continue;
      urls.add(absoluteUrl(request, hostPath({ island: island.slug })));

      const detail = await api<{
        places: Place[];
        businesses: Business[];
      }>(`/v1/islands/${island.slug}`);

      const byId = Object.fromEntries(detail.places.map((p) => [p.id, p]));
      const placeById = new Map(detail.places.map((p) => [p.id, p]));

      for (const place of detail.places) {
        const nest = geoNesting(place, byId);
        urls.add(
          absoluteUrl(
            request,
            hostPath({
              island: island.slug,
              place: nest.hostPlace,
              area: nest.area,
            }),
          ),
        );
      }

      for (const biz of detail.businesses) {
        const place = placeById.get(biz.placeId);
        if (!place) continue;
        const nest = geoNesting(place, byId);
        urls.add(
          absoluteUrl(
            request,
            hostPath({
              island: island.slug,
              place: nest.hostPlace,
              area: nest.area,
              slug: biz.slug,
            }),
          ),
        );
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
