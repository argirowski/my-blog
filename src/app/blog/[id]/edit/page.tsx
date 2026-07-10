import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { authOptions } from "@/lib/auth-options";
import { EditPostForm } from "@/components/edit-post-form";
import { EditPostPageGate } from "@/components/edit-post-page-gate";
import { getPostById } from "@/lib/posts";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditBlogPostPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id < 1) notFound();

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

  const post = getPostById(id);
  if (!post) notFound();

  if (
    post.authorUserId == null ||
    post.authorUserId !== ownerUserId
  ) {
    notFound();
  }

  return (
    <EditPostPageGate>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
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
