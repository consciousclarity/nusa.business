import type { APIRoute } from "astro";
import { api } from "../lib/api";
import {
  absoluteUrl,
  hostPath,
  sitemapXml,
  siteOrigin,
} from "../lib/seo";

type Island = { slug: string; status: string };
type Place = { id: string; slug: string };
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

      const placeById = new Map(detail.places.map((p) => [p.id, p.slug]));

      for (const place of detail.places) {
        urls.add(
          absoluteUrl(
            request,
            hostPath({ island: island.slug, place: place.slug }),
          ),
        );
      }

      for (const biz of detail.businesses) {
        const placeSlug = placeById.get(biz.placeId);
        if (!placeSlug) continue;
        urls.add(
          absoluteUrl(
            request,
            hostPath({
              island: island.slug,
              place: placeSlug,
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
