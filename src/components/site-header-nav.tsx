"use client";

import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { markRouteNavigating } from "@/components/navigation-loader";
import { NavigatingLink } from "@/components/navigating-link";

const navLinkClass =
  "text-sm font-medium text-zinc-600 transition-colors hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-50";

export function SiteHeaderNav() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (el && !el.contains(e.target as Node)) closeMenu();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  if (status === "loading") {
    return (
      <>
        <NavigatingLink href="/blog" className={navLinkClass}>
          Browse Posts
        </NavigatingLink>
        <NavigatingLink href="/auth/register" className={navLinkClass}>
          Register
        </NavigatingLink>
        <NavigatingLink href="/auth/signin" className={navLinkClass}>
          Sign in
        </NavigatingLink>
      </>
    );
  }

  const displayName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "Account";

  return (
    <>
      <NavigatingLink href="/blog" className={navLinkClass}>
        Browse Posts
      </NavigatingLink>
      {!session?.user ? (
        <NavigatingLink href="/auth/register" className={navLinkClass}>
          Register
        </NavigatingLink>
      ) : null}

      {!session?.user ? (
        <NavigatingLink href="/auth/signin" className={navLinkClass}>
          Sign in
        </NavigatingLink>
      ) : (
        <div ref={menuRef} className="relative z-50">
          <button
            type="button"
            className={`${navLinkClass} inline-flex max-w-[12rem] items-center gap-1 truncate rounded px-1 py-0.5 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-900`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls="user-account-menu"
            id="user-account-menu-button"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="truncate">{displayName}</span>
            <span className="shrink-0 text-[0.65rem] opacity-70" aria-hidden>
              ▼
            </span>
          </button>
          {menuOpen ? (
            <div
              id="user-account-menu"
              role="menu"
              aria-labelledby="user-account-menu-button"
              className="absolute right-0 mt-2 min-w-[12rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-950"
            >
              <div
                role="presentation"
                className="border-b border-zinc-100 px-3 py-2 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
              >
                {displayName}
              </div>
              <button
                type="button"
                role="menuitem"
                className="w-full px-3 py-2 text-left font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900"
                onClick={() => {
                  closeMenu();
                  void (async () => {
                    markRouteNavigating();
                    try {
                      await fetch("/api/auth/refresh/revoke", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ revokeAll: true }),
                      });
                    } catch {
                      /* still sign out locally */
                    }
                    await signOut({ callbackUrl: "/" });
                  })();
                }}
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
