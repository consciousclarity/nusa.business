import { defineMiddleware } from "astro:middleware";
import { parseDevHostPath, parseHost, publicUrl } from "@nusa/shared";

function isLocalHost(host: string): boolean {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".localhost") ||
    h === ""
  );
}

/** Public HTML can be short-cached; assets are hashed by the build. */
function withPerfHeaders(response: Response): Response {
  if (!(response.status >= 200 && response.status < 400)) return response;
  const headers = new Headers(response.headers);
  if (!headers.has("X-Content-Type-Options")) {
    headers.set("X-Content-Type-Options", "nosniff");
  }
  const type = headers.get("content-type") || "";
  if (type.includes("text/html") && !headers.has("Cache-Control")) {
    headers.set(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=600",
    );
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Production tenancy:
 * - Real hosts (java.nusa.business, yogyakarta.java.nusa.business) rewrite
 *   invisibly to /host/{label}/… so the public URL stays on the subdomain.
 * - On the nation apex, /host/{label} 301s to the canonical nested host.
 * Localhost keeps /host/... paths as the primary surface.
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const pathname = url.pathname;
  const hostHeader =
    context.request.headers.get("x-forwarded-host") ||
    context.request.headers.get("host") ||
    "";
  const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  const local = isLocalHost(host) || import.meta.env.DEV;

  const hostPath = parseDevHostPath(pathname);
  if (hostPath && !local) {
    const apex = parseHost(hostHeader);
    // Only canonicalize on the nation apex — island/place hosts rewrite
    // into /host/... and must not 301 back out (redirect loop).
    if (
      apex.kind === "nation" &&
      (hostPath.context.kind === "island" || hostPath.context.kind === "place")
    ) {
      const ctx = hostPath.context;
      const target = publicUrl({
        island: ctx.island,
        place: ctx.kind === "place" ? ctx.place : undefined,
        slug:
          hostPath.pathname === "/"
            ? undefined
            : hostPath.pathname.replace(/^\//, ""),
        root: "https://nusa.business",
      });
      return context.redirect(target, 301);
    }
  }

  // Already under /host — serve as-is (dev, or after failed canonicalize)
  if (pathname === "/host" || pathname.startsWith("/host/")) {
    return withPerfHeaders(await next());
  }

  const tenant = parseHost(hostHeader);
  if (tenant.kind === "island") {
    const target = `/host/${tenant.island}${pathname === "/" ? "" : pathname}`;
    return withPerfHeaders(await context.rewrite(target));
  }
  if (tenant.kind === "place") {
    const target = `/host/${tenant.place}.${tenant.island}${pathname === "/" ? "" : pathname}`;
    return withPerfHeaders(await context.rewrite(target));
  }

  return withPerfHeaders(await next());
});
