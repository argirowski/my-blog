"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { deletePostAction } from "@/app/blog/[id]/actions";
import { Loader } from "@/components/loader";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: number;
  /** Called after a successful delete (e.g. navigate away). */
  onSuccess: () => void;
};

export function DeletePostConfirmDialog({
  open,
  onOpenChange,
  postId,
  onSuccess,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      setError(null);
      cancelButtonRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, isPending, onOpenChange]);

  if (!open) return null;

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await deletePostAction(postId);
      if (result.ok) {
        onOpenChange(false);
        onSuccess();
        return;
      }
      setError(
        result.error === "not_found"
          ? "This post was not found. It may have been deleted already."
          : result.error === "forbidden" || result.error === "auth"
            ? "You do not have permission to delete this post."
            : "Could not delete this post.",
      );
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        disabled={isPending}
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-post-dialog-title"
        aria-describedby="delete-post-dialog-description"
      >
        <h2
          id="delete-post-dialog-title"
          className="text-lg font-semibold text-foreground"
        >
          Delete this post?
        </h2>
        <p
          id="delete-post-dialog-description"
          className="mt-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          This will remove the post from your database. You cannot undo this
          action.
        </p>
        {error ? (
          <p
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleConfirm}
            className="inline-flex h-10 min-w-[8.5rem] items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader variant="inline" label="Deleting" />
                Deleting…
              </>
            ) : (
              "Delete post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
