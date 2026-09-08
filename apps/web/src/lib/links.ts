import { nationHomeHref, publicUrl, type Locale, withLocale } from "@nusa/shared";

function requestHost(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  );
}

/** Brand / breadcrumb "nusa.business" → always the nation apex in production. */
export function nationHref(request: Request, locale: Locale = "en"): string {
  const home = nationHomeHref(requestHost(request));
  if (home === "/") return withLocale("/", locale);
  if (locale === "en") return home;
  const u = new URL(home);
  u.pathname = withLocale(u.pathname || "/", "id");
  return u.toString();
}

/** Prefer real nested hosts on nusa.business; keep /host paths for local/dev. */
export function tenantHref(
  request: Request,
  opts: { island: string; place?: string; slug?: string; locale?: Locale },
): string {
  const locale = opts.locale ?? "en";
  const host = requestHost(request).split(":")[0]?.toLowerCase() ?? "";
  const useReal =
    host === "nusa.business" ||
    host.endsWith(".nusa.business");

  if (!useReal) {
    const label = opts.place ? `${opts.place}.${opts.island}` : opts.island;
    const path = opts.slug ? `/host/${label}/${opts.slug}` : `/host/${label}`;
    return withLocale(path, locale);
  }

  const absolute = publicUrl({
    island: opts.island,
    place: opts.place,
    slug: opts.slug,
    root: "https://nusa.business",
  });
  if (locale === "en") return absolute;
  const u = new URL(absolute);
  u.pathname = withLocale(u.pathname || "/", "id");
  return u.toString();
}
