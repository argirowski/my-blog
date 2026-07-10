"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  markPageLoading,
  markPageReady,
} from "@/components/navigation-loader";

const MIN_LOADER_MS = 400;

/**
 * Holds the global loader until optional async `load` finishes and a minimum
 * display time passes. Unmount only releases if not already released.
 */
export function usePageLoadGate(
  load: () => Promise<unknown> = () => Promise.resolve(),
): boolean {
  const [ready, setReady] = useState(false);
  const holdReleasedRef = useRef(false);
  const loadRef = useRef(load);
  loadRef.current = load;

  useLayoutEffect(() => {
    holdReleasedRef.current = false;
    markPageLoading();
    return () => {
      if (!holdReleasedRef.current) markPageReady();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    void loadRef.current().then(
      () => {
        const wait = Math.max(0, MIN_LOADER_MS - (Date.now() - started));
        window.setTimeout(() => {
          if (cancelled) return;
          markPageReady();
          holdReleasedRef.current = true;
          setReady(true);
        }, wait);
      },
      () => {
        if (cancelled) return;
        markPageReady();
        holdReleasedRef.current = true;
        setReady(true);
      },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
