import Link from "next/link";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth-options";
import { NewPostForm } from "@/components/new-post-form";
import { NewPostPageGate } from "@/components/new-post-page-gate";

const CALLBACK_URL = "/blog/new";

export const metadata: Metadata = {
  title: "New post",
  robots: { index: false, follow: false },
};

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(
      `/auth/signin?callbackUrl=${encodeURIComponent(CALLBACK_URL)}`,
    );
  }

  const authorUsername =
    session.user.name?.trim() ||
    session.user.email?.trim() ||
    `(user #${session.user.id})`;

  return (
    <NewPostPageGate>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
        <div>
          <Link
            href="/blog"
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
          >
            ← All posts
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
            New post
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            The post is saved with your signed-in account as owner (
            <code className="text-[0.85em]">posts.user_id</code> ↔{" "}
            <code className="text-[0.85em]">users.id</code>).
          </p>
        </div>

        <NewPostForm authorUsername={authorUsername} />
      </div>
    </NewPostPageGate>
  );
}
