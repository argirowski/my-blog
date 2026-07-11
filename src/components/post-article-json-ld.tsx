import type { BlogPost } from "@/lib/post-types";
import { buildPostArticleJsonLd } from "@/lib/post-json-ld";

type Props = {
  post: BlogPost;
};

export function PostArticleJsonLd({ post }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(buildPostArticleJsonLd(post)),
      }}
    />
  );
}
