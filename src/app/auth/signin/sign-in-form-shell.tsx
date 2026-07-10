"use client";

import dynamic from "next/dynamic";

import { NavigatingLink } from "@/components/navigating-link";
import { usePageLoadGate } from "@/components/use-page-load-gate";

const SignInForm = dynamic(
  () => import("@/app/auth/signin/sign-in-form").then((m) => m.SignInForm),
  { ssr: false },
);

export function SignInFormShell() {
  const ready = usePageLoadGate(() => import("@/app/auth/signin/sign-in-form"));

  if (!ready) return null;

  return (
    <>
      <NavigatingLink
        href="/"
        className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-foreground hover:underline dark:text-zinc-400"
      >
        ← Home
      </NavigatingLink>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Use your email and password from registration.
      </p>
      <SignInForm />
    </>
  );
}
