"use client";

import { type ReactNode } from "react";

import { usePageLoadGate } from "@/components/use-page-load-gate";

export function HomePageGate({ children }: { children: ReactNode }) {
  const ready = usePageLoadGate();
  if (!ready) return null;
  return children;
}
