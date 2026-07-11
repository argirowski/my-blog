const DEFAULT_SITE_URL = "http://localhost:3000";

/** Canonical site origin for metadata, sitemap, and robots. Uses `NEXTAUTH_URL`. */
export function getSiteUrl(): URL {
  return new URL(process.env.NEXTAUTH_URL ?? DEFAULT_SITE_URL);
}

export function siteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}
