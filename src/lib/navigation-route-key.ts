/** Matches {@link NavigationLoader} route identity (`pathname?query`). */
export function routeKeyFromParts(pathname: string, searchParams: URLSearchParams) {
  return `${pathname}?${searchParams.toString()}`;
}

export function routeKeyFromHref(
  href: string | { pathname?: string | null; search?: string | null },
  origin: string,
): string | null {
  const raw =
    typeof href === "string"
      ? href
      : href.pathname
        ? `${href.pathname}${href.search ?? ""}`
        : "";
  if (!raw || raw.startsWith("#")) return null;
  try {
    const next = new URL(raw, origin);
    const qs = next.search.startsWith("?") ? next.search.slice(1) : next.search;
    return `${next.pathname}?${qs}`;
  } catch {
    return null;
  }
}

export function isSameAppRoute(
  href: string | { pathname?: string | null; search?: string | null },
  pathname: string,
  searchParams: URLSearchParams,
  origin: string,
): boolean {
  const target = routeKeyFromHref(href, origin);
  if (target == null) return false;
  return target === routeKeyFromParts(pathname, searchParams);
}
