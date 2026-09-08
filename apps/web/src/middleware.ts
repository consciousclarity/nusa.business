import { defineMiddleware } from "astro:middleware";
import {
  detectLocale,
  parseDevHostPath,
  parseHost,
  publicUrl,
  withLocale,
} from "@nusa/shared";

function isLocalHost(host: string): boolean {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h.endsWith(".localhost") ||
    h === ""
  );
}

/**
 * Production tenancy:
 * - Real hosts rewrite invisibly to /host/{label}/…
 * - Nation apex /host/{label} 301s to the canonical nested host.
 *
 * Locale: optional `/id` prefix. Stripped with `next(path)` so middleware does
 * **not** re-run (a `rewrite()` would re-detect locale as `en` on `/`).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  const url = context.url;
  const { locale, pathWithoutLocale } = detectLocale(url.pathname);
  context.locals.locale = locale;

  const hostHeader =
    context.request.headers.get("x-forwarded-host") ||
    context.request.headers.get("host") ||
    "";
  const host = hostHeader.split(":")[0]?.toLowerCase() ?? "";
  const local = isLocalHost(host) || import.meta.env.DEV;

  const hostPath = parseDevHostPath(pathWithoutLocale);
  if (hostPath && !local) {
    const apex = parseHost(hostHeader);
    if (
      apex.kind === "nation" &&
      (hostPath.context.kind === "island" || hostPath.context.kind === "place")
    ) {
      const ctx = hostPath.context;
      const slugPath =
        hostPath.pathname === "/"
          ? undefined
          : hostPath.pathname.replace(/^\//, "");
      const target = publicUrl({
        island: ctx.island,
        place: ctx.kind === "place" ? ctx.place : undefined,
        slug: slugPath,
        root: "https://nusa.business",
      });
      if (locale === "id") {
        const u = new URL(target);
        u.pathname = withLocale(u.pathname, "id");
        return context.redirect(u.toString(), 301);
      }
      return context.redirect(target, 301);
    }
  }

  // Strip /id without re-entering middleware (keeps locals.locale = id).
  if (pathWithoutLocale !== url.pathname) {
    const stripped = `${pathWithoutLocale}${url.search}`;

    if (
      pathWithoutLocale === "/host" ||
      pathWithoutLocale.startsWith("/host/")
    ) {
      return next(stripped);
    }

    const tenant = parseHost(hostHeader);
    if (tenant.kind === "island") {
      const target = `/host/${tenant.island}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
      return next(`${target}${url.search}`);
    }
    if (tenant.kind === "place") {
      const target = `/host/${tenant.place}.${tenant.island}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
      return next(`${target}${url.search}`);
    }

    return next(stripped);
  }

  if (pathWithoutLocale === "/host" || pathWithoutLocale.startsWith("/host/")) {
    return next();
  }

  const tenant = parseHost(hostHeader);
  if (tenant.kind === "island") {
    const target = `/host/${tenant.island}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
    return next(`${target}${url.search}`);
  }
  if (tenant.kind === "place") {
    const target = `/host/${tenant.place}.${tenant.island}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
    return next(`${target}${url.search}`);
  }

  return next();
});
