"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { SessionRefreshHeartbeat } from "@/components/session-refresh-heartbeat";

type Props = {
  children: React.ReactNode;
  session: Session | null;
};

export function AuthSessionProvider({ children, session }: Props) {
  return (
    <SessionProvider session={session}>
      <SessionRefreshHeartbeat />
      {children}
    </SessionProvider>
  );
}
