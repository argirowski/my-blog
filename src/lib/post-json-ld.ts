import type { BlogPost } from "@/lib/post-types";
import { siteUrl } from "@/lib/site-url";

/** Schema.org Article JSON-LD for a blog post detail page. */
export function buildPostArticleJsonLd(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    url: siteUrl(`/blog/${post.id}`),
    image: siteUrl(`/blog/${post.id}/opengraph-image`),
    publisher: {
      "@type": "Organization",
      name: "My Blog",
    },
  };
}
