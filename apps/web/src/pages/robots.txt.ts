import type { APIRoute } from "astro";
import { siteOrigin } from "../lib/seo";

export const GET: APIRoute = ({ request }) => {
  const origin = siteOrigin(request);
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /id/search",
    "Disallow: /search",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
    "# Account portal and API are separate hosts. This file is not access control.",
    "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
