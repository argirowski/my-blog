"use client";

import { useSession } from "next-auth/react";

import { NavigatingLink } from "@/components/navigating-link";

export function BlogHomeHeader() {
  const { data: session } = useSession();
  const canCreatePost = Boolean(session?.user?.id);

  return (
    <header
      className={
        canCreatePost
          ? "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          : "flex flex-col gap-4"
      }
    >
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Blog
        </h1>
        <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          Latest writing, newest first. Open a title to read the full post.
        </p>
      </div>
      {canCreatePost ? (
        <NavigatingLink
          href="/blog/new"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          New post
        </NavigatingLink>
      ) : (
        <div className="flex shrink-0 flex-col items-start gap-2">
          <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-400">
            Sign in to publish your own story on the list.
          </p>
          <NavigatingLink
            href={`/auth/signin?callbackUrl=${encodeURIComponent("/blog/new")}`}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:hover:bg-zinc-900"
          >
            Sign in to post
          </NavigatingLink>
        </div>
      )}
    </header>
  );
}
