import { publicUrl } from "@nusa/shared";

/** Prefer real nested hosts on nusa.business; keep /host paths for local/dev. */
export function tenantHref(
  request: Request,
  opts: { island: string; place?: string; slug?: string },
): string {
  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(":")[0]
    ?.toLowerCase() ?? "";
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
