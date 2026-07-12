import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostDetailOwnerActions } from "@/components/post-detail-owner-actions";
import { PostDetailPageGate } from "@/components/post-detail-page-gate";
import { PostArticleJsonLd } from "@/components/post-article-json-ld";
import { OG_IMAGE_SIZE } from "@/lib/og-image";
import { getAllPosts, getPostById } from "@/lib/posts";

type Props = {
  params: Promise<{ id: string }>;
};

/** ISR: regenerate cached post pages at most once per minute. */
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    id: String(post.id),
  }));
}

function parsePostId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (id == null) {
    return { title: "Post not found" };
  }

  const post = await getPostById(id);
  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.id}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: `/blog/${post.id}/opengraph-image`,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [`/blog/${post.id}/opengraph-image`],
    },
  };
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

export default async function BlogPostPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (id == null) notFound();

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <PostDetailPageGate>
      <PostArticleJsonLd post={post} />
      <article className="w-full">
        <Link
          href="/blog"
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
        >
          ← All posts
        </Link>
        <header className="mt-8 space-y-2 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span className="text-zinc-400 dark:text-zinc-500"> · </span>
            <span>{post.author}</span>
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {post.title}
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">{post.excerpt}</p>
        </header>
        <div className="mt-8">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground">
            {post.content}
          </p>
        </div>
        <PostDetailOwnerActions
          postId={post.id}
          authorUserId={post.authorUserId}
        />
      </article>
    </PostDetailPageGate>
  );
}
