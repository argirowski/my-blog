import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import { authOptions } from "@/lib/auth-options";
import { PostDetailActions } from "@/components/post-detail-actions";
import { PostDetailPageGate } from "@/components/post-detail-page-gate";
import { getPostById } from "@/lib/posts";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

export default async function BlogPostPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) notFound();

  const session = await getServerSession(authOptions);
  const post = getPostById(id);
  if (!post) notFound();

  const viewerRaw = session?.user?.id ? Number(session.user.id) : NaN;
  const viewerId =
    Number.isInteger(viewerRaw) && viewerRaw >= 1 ? viewerRaw : NaN;
  const canModifyPost =
    Number.isInteger(viewerId) &&
    post.authorUserId != null &&
    viewerId === post.authorUserId;

  return (
    <PostDetailPageGate>
      <article className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
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
        {canModifyPost ? <PostDetailActions postId={post.id} /> : null}
      </article>
    </PostDetailPageGate>
  );
}
