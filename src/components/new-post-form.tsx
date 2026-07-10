"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import Link from "next/link";

import { createPostAction } from "@/app/blog/new/actions";
import { Loader } from "@/components/loader";
import { markRouteNavigating } from "@/components/navigation-loader";
import { PublicationDatePicker } from "@/components/publication-date-picker";
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog";
import {
  newPostFormSchema,
  todayIsoDate,
  type NewPostFormValues,
} from "@/lib/post-form-schema";

const labelClass =
  "mb-1 block text-sm font-medium text-foreground";
const inputClass =
  "w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500";
const errorClass = "mt-1 text-sm text-red-600 dark:text-red-400";
type Props = {
  /** `users.username` for the signed-in author (shown read-only). */
  authorUsername: string;
};

export function NewPostForm({ authorUsername }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [discardOpen, setDiscardOpen] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<NewPostFormValues>({
    resolver: zodResolver(newPostFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      publishedAt: todayIsoDate(),
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await createPostAction(data);
      if (result.success) {
        markRouteNavigating();
        router.push("/blog?postCreated=1");
        return;
      }
      if ("unauthorized" in result && result.unauthorized) {
        setError("root", {
          type: "server",
          message:
            "You must stay signed in to publish. Refresh the page or sign in again.",
        });
        return;
      }
      if (result.fieldErrors) {
        for (const key of Object.keys(result.fieldErrors) as (keyof NewPostFormValues)[]) {
          const messages = result.fieldErrors[key];
          const message = messages?.[0];
          if (message) {
            setError(key, { type: "server", message });
          }
        }
      }
    });
  });

  function leaveWithoutSaving() {
    markRouteNavigating();
    router.push("/blog");
  }

  return (
    <>
      {isPending ? <Loader variant="overlay" label="Saving…" /> : null}
      <UnsavedChangesDialog
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        onConfirmLeave={leaveWithoutSaving}
      />
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-8"
      noValidate
    >
      {errors.root ? (
        <p className={errorClass} role="alert">
          {errors.root.message}{" "}
          <Link
            href={`/auth/signin?callbackUrl=${encodeURIComponent("/blog/new")}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      ) : null}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            type="text"
            autoComplete="off"
            className={inputClass}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
          />
          {errors.title ? (
            <p id="title-error" className={errorClass} role="alert">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2 sm:max-w-md">
          <p className={labelClass}>Author</p>
          <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {authorUsername}
          </p>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Pulled from your account (<code className="text-[0.85em]">users.username</code>
            ).
          </p>
        </div>

        <div className="sm:col-span-2 sm:max-w-xs">
          <Controller
            name="publishedAt"
            control={control}
            render={({ field }) => (
              <PublicationDatePicker
                id="publishedAt"
                label="Publication date"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.publishedAt?.message}
                disabled={isPending}
              />
            )}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="excerpt" className={labelClass}>
            Excerpt
          </label>
          <textarea
            id="excerpt"
            rows={3}
            className={inputClass}
            aria-invalid={errors.excerpt ? true : undefined}
            aria-describedby={errors.excerpt ? "excerpt-error" : undefined}
            {...register("excerpt")}
          />
          {errors.excerpt ? (
            <p id="excerpt-error" className={errorClass} role="alert">
              {errors.excerpt.message}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="content" className={labelClass}>
            Content
          </label>
          <textarea
            id="content"
            rows={12}
            className={`${inputClass} font-mono text-sm`}
            aria-invalid={errors.content ? true : undefined}
            aria-describedby={errors.content ? "content-error" : undefined}
            {...register("content")}
          />
          {errors.content ? (
            <p id="content-error" className={errorClass} role="alert">
              {errors.content.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Publish post"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (isDirty) setDiscardOpen(true);
            else leaveWithoutSaving();
          }}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Cancel
        </button>
      </div>
    </form>
    </>
  );
}
