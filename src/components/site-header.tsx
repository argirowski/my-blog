import Link from "next/link";

import { SiteHeaderNav } from "@/components/site-header-nav";

const APP_NAME = "My Blog";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-background/80 backdrop-blur-md dark:border-zinc-800">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-foreground"
        >
          {APP_NAME}
        </Link>
        <nav
          className="flex shrink-0 items-center gap-4 sm:gap-6"
          aria-label="Main"
        >
          <SiteHeaderNav />
        </nav>
      </div>
    </header>
  );
}
