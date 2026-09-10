import { withLocale, type Locale, type UiKey } from "../i18n/ui";
import { tenantHref } from "./links";

/** Hero chips: visitor labels mapped onto existing taxonomy group slugs. */
export const HERO_CATEGORIES: readonly {
  key: UiKey;
  slug: string;
}[] = [
  { key: "catFood", slug: "food-drink" },
  { key: "catStays", slug: "hotels-accommodation" },
  { key: "catExperiences", slug: "travel-experiences" },
  { key: "catTransport", slug: "transport-automotive" },
  { key: "catWellness", slug: "health-medical" },
];

export function heroCategoryHref(
  request: Request,
  opts: {
    locale: Locale;
    slug: string;
    island?: string;
    place?: string;
    area?: string;
  },
): string {
  if (opts.island) {
    return tenantHref(request, {
      island: opts.island,
      place: opts.place,
      area: opts.area,
      category: opts.slug,
      locale: opts.locale,
    });
  }
  return `${withLocale("/search", opts.locale)}?category=${encodeURIComponent(opts.slug)}`;
}
