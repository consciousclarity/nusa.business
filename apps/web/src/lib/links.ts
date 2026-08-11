import { nationHomeHref, publicUrl } from "@nusa/shared";

function requestHost(request: Request): string {
  return (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  );
}

/** Brand / breadcrumb "nusa.business" → always the nation apex in production. */
export function nationHref(request: Request): string {
  return nationHomeHref(requestHost(request));
}

/** Prefer real nested hosts on nusa.business; keep /host paths for local/dev. */
export function tenantHref(
  request: Request,
  opts: { island: string; place?: string; slug?: string },
): string {
  const host = requestHost(request).split(":")[0]?.toLowerCase() ?? "";
  const useReal =
    host === "nusa.business" ||
    host.endsWith(".nusa.business");

  if (!useReal) {
    const label = opts.place ? `${opts.place}.${opts.island}` : opts.island;
    return opts.slug ? `/host/${label}/${opts.slug}` : `/host/${label}`;
  }

  return publicUrl({
    island: opts.island,
    place: opts.place,
    slug: opts.slug,
    root: "https://nusa.business",
  });
}
