"use client";

import { getSession, useSession } from "next-auth/react";
import { useEffect } from "react";

/** Rotate the short-lived JWT before one hour elapses (`SESSION_COOKIE_MAX_AGE_SEC`). */
const REFRESH_POLL_MS = 45 * 60 * 1000;

export function SessionRefreshHeartbeat() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return undefined;

    async function ping() {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          await getSession();
        }
      } catch {
        /* ignore transient network failures */
      }
    }

    const id = window.setInterval(ping, REFRESH_POLL_MS);
    return () => window.clearInterval(id);
  }, [status]);

  return null;
}
