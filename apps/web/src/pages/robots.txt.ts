import type { APIRoute } from "astro";
import { siteOrigin } from "../lib/seo";

export const GET: APIRoute = ({ request }) => {
  const origin = siteOrigin(request);
  const body = [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
