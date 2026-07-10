import { NavigatingLink } from "@/components/navigating-link";

const inlineLinkClass =
  "font-bold text-foreground no-underline underline-offset-4 transition-colors hover:underline hover:decoration-foreground dark:hover:decoration-zinc-200";

export function MarketingHomePage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-center text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
        Welcome back
      </h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
        <p>
          Glad you wandered in. This is a small publication for people who still like a
          full page of words: long-ish posts, imperfect arguments, and the occasional note
          on how something actually felt to build—not just how it shipped.
        </p>
        <p>
          You will find a mix of drafts and finished pieces here—ideas in progress beside
          the ones worth saving. Nothing is optimized for outrage or five-second attention;
          the hope is simply that something you read makes you pause, rethink, or want to
          write your own paragraph in reply.
        </p>
        <p>
          If that sounds worth your tea break, stay for a while and read what is already
          on the shelf. When you are ready to write as well,{" "}
          <NavigatingLink href="/auth/signin" className={inlineLinkClass}>
            sign in
          </NavigatingLink>{" "}
          with an existing account or{" "}
          <NavigatingLink href="/auth/register" className={inlineLinkClass}>
            register
          </NavigatingLink>{" "}
          to get started—there is almost always room for one more thoughtful post.
        </p>
      </div>
    </div>
  );
}
