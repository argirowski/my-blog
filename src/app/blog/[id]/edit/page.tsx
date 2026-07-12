import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth-options";
import { EditPostForm } from "@/components/edit-post-form";
import { EditPostPageGate } from "@/components/edit-post-page-gate";
import { getPostById } from "@/lib/posts";

type Props = {
  params: Promise<{ id: string }>;
};

const privatePageRobots: Metadata["robots"] = { index: false, follow: false };

function parsePostId(idParam: string): number | null {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) return null;
  return id;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (id == null) {
    return { title: "Edit post", robots: privatePageRobots };
  }

  const post = await getPostById(id);
  return {
    title: post ? `Edit: ${post.title}` : "Edit post",
    robots: privatePageRobots,
  };
}

export default async function EditBlogPostPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parsePostId(idParam);
  if (id == null) notFound();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(
      `/auth/signin?callbackUrl=${encodeURIComponent(`/blog/${id}/edit`)}`,
    );
  }

  const ownerUserId = Number(session.user.id);
  if (!Number.isSafeInteger(ownerUserId) || ownerUserId < 1) {
    redirect(
      `/auth/signin?callbackUrl=${encodeURIComponent(`/blog/${id}/edit`)}`,
    );
  }

  const post = await getPostById(id);
  if (!post) notFound();

  if (
    post.authorUserId == null ||
    post.authorUserId !== ownerUserId
  ) {
    notFound();
  }

  return (
    <EditPostPageGate>
      <div className="flex flex-col gap-8">
        <div>
          <Link
            href={`/blog/${post.id}`}
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
          >
            ← Back to post
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
            Edit post
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Update the fields below. Ownership stays with your account; the author
            label matches your username stored on the post.
          </p>
        </div>

        <EditPostForm post={post} />
      </div>
    </EditPostPageGate>
  );
}
