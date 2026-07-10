"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useState, useTransition } from "react";

import { updatePostAction } from "@/app/blog/[id]/edit/actions";
import { Loader } from "@/components/loader";
import { markRouteNavigating } from "@/components/navigation-loader";
import { PublicationDatePicker } from "@/components/publication-date-picker";
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog";
import {
  newPostFormSchema,
  type NewPostFormValues,
} from "@/lib/post-form-schema";
import type { BlogPost } from "@/lib/post-types";

const labelClass =
  "mb-1 block text-sm font-medium text-foreground";
const inputClass =
  "w-full resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500";
const errorClass = "mt-1 text-sm text-red-600 dark:text-red-400";

type Props = {
  post: BlogPost;
};

export function EditPostForm({ post }: Props) {
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
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      publishedAt: post.publishedAt,
    },
  });

  const onSubmit = handleSubmit((data) => {
    startTransition(async () => {
      const result = await updatePostAction(post.id, data);
      if (result.success) {
        markRouteNavigating();
        router.push("/blog?postUpdated=1");
        return;
      }
      if (result.notFound) {
        setError("root", {
          type: "server",
          message: "This post no longer exists. It may have been deleted.",
        });
        return;
      }
      if (result.unauthorized) {
        setError("root", {
          type: "server",
          message:
            "You cannot edit this post unless you created it while signed in.",
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
    router.push(`/blog/${post.id}`);
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
            {errors.root.message}
          </p>
        ) : null}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="edit-title" className={labelClass}>
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              autoComplete="off"
              className={inputClass}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "edit-title-error" : undefined}
              {...register("title")}
            />
            {errors.title ? (
              <p id="edit-title-error" className={errorClass} role="alert">
                {errors.title.message}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2 sm:max-w-md">
            <p className={labelClass}>Author</p>
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
              {post.author}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Locked to this post&apos;s owning account.
            </p>
          </div>

          <div className="sm:col-span-2 sm:max-w-xs">
            <Controller
              name="publishedAt"
              control={control}
              render={({ field }) => (
                <PublicationDatePicker
                  id="edit-publishedAt"
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
            <label htmlFor="edit-excerpt" className={labelClass}>
              Excerpt
            </label>
            <textarea
              id="edit-excerpt"
              rows={3}
              className={inputClass}
              aria-invalid={errors.excerpt ? true : undefined}
              aria-describedby={errors.excerpt ? "edit-excerpt-error" : undefined}
              {...register("excerpt")}
            />
            {errors.excerpt ? (
              <p id="edit-excerpt-error" className={errorClass} role="alert">
                {errors.excerpt.message}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="edit-content" className={labelClass}>
              Content
            </label>
            <textarea
              id="edit-content"
              rows={12}
              className={`${inputClass} font-mono text-sm`}
              aria-invalid={errors.content ? true : undefined}
              aria-describedby={errors.content ? "edit-content-error" : undefined}
              {...register("content")}
            />
            {errors.content ? (
              <p id="edit-content-error" className={errorClass} role="alert">
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
            {isPending ? "Saving…" : "Save changes"}
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
