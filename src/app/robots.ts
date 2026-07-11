import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/auth/", "/blog/new", "/api/"],
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
