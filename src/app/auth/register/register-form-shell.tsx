"use client";

import dynamic from "next/dynamic";

import { NavigatingLink } from "@/components/navigating-link";
import { usePageLoadGate } from "@/components/use-page-load-gate";

const RegisterForm = dynamic(
  () => import("@/app/auth/register/register-form").then((m) => m.RegisterForm),
  { ssr: false },
);

export function RegisterFormShell() {
  const ready = usePageLoadGate(() =>
    import("@/app/auth/register/register-form"),
  );

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
        Create account
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Pick a username, email, and password. Your password is stored as a bcrypt
        hash in SQLite — never plaintext.
      </p>
      <RegisterForm />
    </>
  );
}
