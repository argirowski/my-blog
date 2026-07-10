import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";
import { NavigatingLink } from "@/components/navigating-link";
import { getAllPosts } from "@/lib/posts";

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(isoDate));
}

export async function BlogHomePage() {
  const session = await getServerSession(authOptions);
  const posts = getAllPosts();

  const canCreatePost = Boolean(session?.user?.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-12 sm:px-6">
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

      <section aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="sr-only">
          Posts
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm leading-relaxed text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            The shelf is empty for now. When the first post lands, it will show up here.
            If you write for this site, add a post and this page will fill in on its own.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {posts.map((post) => (
              <li key={post.id}>
                <article className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <time dateTime={post.publishedAt}>
                        {formatDate(post.publishedAt)}
                      </time>
                      <span className="text-zinc-400 dark:text-zinc-500"> · </span>
                      <span>{post.author}</span>
                    </p>
                    <h3 className="text-lg font-medium text-foreground">
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {post.excerpt}
                    </p>
                    <div>
                      <NavigatingLink
                        href={`/blog/${post.id}`}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                      >
                        View post
                      </NavigatingLink>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
