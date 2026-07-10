"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  /** @default 4000 */
  durationMs?: number;
};

export function FlashToast({
  message,
  visible,
  onDismiss,
  durationMs = 4000,
}: Props) {
  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [visible, onDismiss, durationMs]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex max-w-md items-start gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-base text-green-900 shadow-lg dark:border-green-900 dark:bg-green-950/90 dark:text-green-100"
    >
      <p className="flex-1 font-medium leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md px-1 py-0.5 text-lg leading-none text-green-700 transition-colors hover:bg-green-100 hover:text-green-900 dark:text-green-300 dark:hover:bg-green-900 dark:hover:text-green-50"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
