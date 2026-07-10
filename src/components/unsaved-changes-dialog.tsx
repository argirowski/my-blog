"use client";

import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the user chooses to leave and discard edits. */
  onConfirmLeave: () => void;
};

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirmLeave,
}: Props) {
  const stayButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = requestAnimationFrame(() => stayButtonRef.current?.focus());
    return () => cancelAnimationFrame(t);
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
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        aria-label="Close dialog"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-changes-title"
        aria-describedby="unsaved-changes-description"
      >
        <h2
          id="unsaved-changes-title"
          className="text-lg font-semibold text-foreground"
        >
          Discard changes?
        </h2>
        <p
          id="unsaved-changes-description"
          className="mt-2 text-sm text-zinc-600 dark:text-zinc-400"
        >
          You have unsaved changes. If you leave now, you will lose them.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={stayButtonRef}
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-foreground transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-950 dark:hover:bg-zinc-800"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirmLeave();
            }}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Discard and leave
          </button>
        </div>
      </div>
    </div>
  );
}
