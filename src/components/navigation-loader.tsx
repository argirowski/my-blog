"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

import { Loader } from "@/components/loader";

export const GLOBAL_LOADER_LABEL = "Loading";

/** So fast static navigations still show the overlay briefly */
const MIN_VISIBLE_MS = 400;

let notifyNavStart: (() => void) | null = null;
let notifyPageLoadStart: (() => void) | null = null;
let notifyPageLoadEnd: (() => void) | null = null;

/** Show the global overlay during client navigations (`router.push`, links). */
export function markRouteNavigating() {
  notifyNavStart?.();
}

/** Keep the global overlay until {@link markPageReady}. */
export function markPageLoading() {
  notifyPageLoadStart?.();
}

export function markPageReady() {
  notifyPageLoadEnd?.();
}

function isInternalNavLink(a: HTMLAnchorElement): boolean {
  if (a.target === "_blank" || a.download) return false;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#")) return false;
  try {
    const next = new URL(href, window.location.origin);
    if (next.origin !== window.location.origin) return false;
    const current = `${window.location.pathname}${window.location.search}`;
    const target = `${next.pathname}${next.search}`;
    if (target === current) return false;
    return true;
  } catch {
    return false;
  }
}

export function NavigationLoader({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [navPending, setNavPending] = useState(false);
  const [pageHoldCount, setPageHoldCount] = useState(0);
  const routeKeyRef = useRef(routeKey);
  const loaderShownAtRef = useRef<number | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = navPending || pageHoldCount > 0;

  const beginNavigation = useCallback(() => {
    if (clearTimerRef.current !== null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    loaderShownAtRef.current = Date.now();
    flushSync(() => {
      setNavPending(true);
    });
    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = null;
      setNavPending(false);
      loaderShownAtRef.current = null;
    }, MIN_VISIBLE_MS);
  }, []);

  const beginPageHold = useCallback(() => {
    setPageHoldCount((count) => count + 1);
  }, []);

  const endPageHold = useCallback(() => {
    setPageHoldCount((count) => Math.max(0, count - 1));
  }, []);

  useEffect(() => {
    notifyNavStart = beginNavigation;
    notifyPageLoadStart = beginPageHold;
    notifyPageLoadEnd = endPageHold;
    return () => {
      notifyNavStart = null;
      notifyPageLoadStart = null;
      notifyPageLoadEnd = null;
    };
  }, [beginNavigation, beginPageHold, endPageHold]);

  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;

    routeKeyRef.current = routeKey;

    if (clearTimerRef.current !== null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    const shownAt = loaderShownAtRef.current;
    if (shownAt === null) return;

    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - shownAt));
    clearTimerRef.current = setTimeout(() => {
      clearTimerRef.current = null;
      setNavPending(false);
      loaderShownAtRef.current = null;
    }, wait);

    return () => {
      if (clearTimerRef.current !== null) {
        clearTimeout(clearTimerRef.current);
        clearTimerRef.current = null;
      }
    };
  }, [routeKey]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as HTMLElement | null)?.closest("a[href]");
      if (!el) return;
      if (!isInternalNavLink(el as HTMLAnchorElement)) return;
      beginNavigation();
    };
    document.addEventListener("click", onClick, false);
    return () => document.removeEventListener("click", onClick, false);
  }, [beginNavigation]);

  return (
    <>
      {children}
      {visible ? (
        <Loader variant="overlay" label={GLOBAL_LOADER_LABEL} />
      ) : null}
    </>
  );
}
