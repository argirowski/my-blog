"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

import { markRouteNavigating } from "@/components/navigation-loader";
import { NavigatingLink } from "@/components/navigating-link";

function safeAppPath(raw: string | null, fallback: string): string {
  if (raw === null || raw === undefined) return fallback;
  let t: string;
  try {
    t = decodeURIComponent(raw).trim();
  } catch {
    return fallback;
  }
  if (t === "") return fallback;
  if (!t.startsWith("/")) return fallback;
  if (t.startsWith("//")) return fallback;
  if (t.includes("://")) return fallback;
  return t;
}

function withQueryParam(path: string, key: string, value: string): string {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  params.set(key, value);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .refine(
      (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.toLowerCase()),
      "Enter a valid email address",
    ),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

/** Used when sign-in URL has no `callbackUrl` (e.g. header “Sign in”). */
const DEFAULT_AFTER_SIGN_IN = "/blog";

const labelClass =
  "mb-1 block text-sm font-medium text-foreground";
const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500";
const errorClass = "mt-1 text-sm text-red-600 dark:text-red-400";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterSignInPath = safeAppPath(
    searchParams.get("callbackUrl"),
    DEFAULT_AFTER_SIGN_IN,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    const res = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
    });

    if (res?.error) {
      setFormError("Incorrect email or password.");
      return;
    }

    if (res?.ok) {
      try {
        await fetch("/api/auth/refresh/bootstrap", {
          method: "POST",
          credentials: "include",
        });
      } catch {
        /* heartbeat / next manual refresh may still bootstrap if needed */
      }
      const pathname = afterSignInPath.split("?")[0];
      const destination =
        pathname === "/blog"
          ? withQueryParam(afterSignInPath, "loggedIn", "1")
          : afterSignInPath;
      markRouteNavigating();
      router.push(destination);
    }
  });

  return (
    <form
      className="mx-auto mt-8 flex w-full max-w-md flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
    >
      {formError ? (
        <p className={errorClass} role="alert">
          {formError}
        </p>
      ) : null}

      <div>
        <label htmlFor="signin-email" className={labelClass}>
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          className={inputClass}
          aria-invalid={errors.email ? true : undefined}
          {...register("email")}
        />
        {errors.email ? (
          <p className={errorClass} role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="signin-password" className={labelClass}>
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          autoComplete="current-password"
          className={inputClass}
          aria-invalid={errors.password ? true : undefined}
          {...register("password")}
        />
        {errors.password ? (
          <p className={errorClass} role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        No account yet?{" "}
        <NavigatingLink
          href="/auth/register"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Register
        </NavigatingLink>
      </p>
    </form>
  );
}
