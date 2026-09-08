export type Locale = "en" | "id";

export const LOCALES: Locale[] = ["en", "id"];

export function detectLocale(pathname: string): {
  locale: Locale;
  pathWithoutLocale: string;
} {
  if (pathname === "/id" || pathname.startsWith("/id/")) {
    const rest = pathname === "/id" ? "/" : pathname.slice(3);
    const pathWithoutLocale = rest.startsWith("/") ? rest : `/${rest}`;
    return {
      locale: "id",
      pathWithoutLocale: pathWithoutLocale || "/",
    };
  }
  return { locale: "en", pathWithoutLocale: pathname || "/" };
}

/** Prefix a site path with `/id` when locale is Indonesian. */
export function withLocale(path: string, locale: Locale): string {
  const normalized =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;
  if (locale === "en") return normalized;
  if (normalized === "/") return "/id";
  return `/id${normalized}`;
}

export function alternateLocale(locale: Locale): Locale {
  return locale === "en" ? "id" : "en";
}
