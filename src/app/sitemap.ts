import type { MetadataRoute } from "next";

import { getAllPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: siteUrl("/blog"),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: siteUrl(`/blog/${post.id}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...postRoutes];
}
