"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";

import { registerAction } from "@/app/auth/register/actions";
import { Loader } from "@/components/loader";
import { markRouteNavigating } from "@/components/navigation-loader";
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/lib/register-schema";

const labelClass =
  "mb-1 block text-sm font-medium text-foreground";
const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500";
const errorClass = "mt-1 text-sm text-red-600 dark:text-red-400";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rootMessage, setRootMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit((data) => {
    setRootMessage(null);
    startTransition(async () => {
      const result = await registerAction(data);
      if (result.success) {
        markRouteNavigating();
        router.push("/auth/signin?registered=1");
        return;
      }
      if (result.message) setRootMessage(result.message);
      if (result.fieldErrors) {
        for (const key of Object.keys(result.fieldErrors) as (keyof RegisterFormValues)[]) {
          const msg = result.fieldErrors[key]?.[0];
          if (msg) setError(key, { type: "server", message: msg });
        }
      }
    });
  });

  return (
    <>
      {isPending ? <Loader variant="overlay" label="Creating account…" /> : null}
      <form
        className="mx-auto mt-8 flex w-full max-w-md flex-col gap-5"
        onSubmit={onSubmit}
        noValidate
      >
        {rootMessage ? (
          <p className={errorClass} role="alert">
            {rootMessage}
          </p>
        ) : null}

        <div>
          <label htmlFor="register-username" className={labelClass}>
            Username
          </label>
          <input
            id="register-username"
            type="text"
            autoComplete="username"
            className={inputClass}
            aria-invalid={errors.username ? true : undefined}
            {...register("username")}
          />
          {errors.username ? (
            <p className={errorClass} role="alert">
              {errors.username.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="register-email" className={labelClass}>
            Email
          </label>
          <input
            id="register-email"
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
          <label htmlFor="register-password" className={labelClass}>
            Password
          </label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
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

        <div>
          <label htmlFor="register-confirm" className={labelClass}>
            Repeat password
          </label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            aria-invalid={errors.confirmPassword ? true : undefined}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p className={errorClass} role="alert">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </>
  );
}
