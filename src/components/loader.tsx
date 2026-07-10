type LoaderVariant = "page" | "overlay" | "inline";

type LoaderProps = {
  variant?: LoaderVariant;
  /** Visually hidden / supporting label for screen readers */
  label?: string;
  className?: string;
};

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={[
        "inline-block rounded-full border-2 border-zinc-200 border-t-foreground dark:border-zinc-700 dark:border-t-zinc-200",
        className ?? "size-8 border-[3px]",
      ].join(" ")}
      aria-hidden
    />
  );
}

/**
 * Custom loading indicator. Use `page` in `loading.tsx`, `overlay` during
 * client transitions (forms, redirects), `inline` inside buttons.
 */
export function Loader({
  variant = "page",
  label = "Loading",
  className = "",
}: LoaderProps) {
  const text = (
    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
      {label}
    </p>
  );

  if (variant === "inline") {
    return (
      <span
        className={["inline-flex items-center gap-2", className].join(" ")}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <Spinner className="size-4 animate-spin border-2" />
      </span>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        className={[
          "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-[2px]",
          className,
        ].join(" ")}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner className="size-10 animate-spin border-[3px]" />
        {text}
      </div>
    );
  }

  return (
    <div
      className={[
        "flex flex-1 flex-col items-center justify-center gap-4 py-24",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner className="size-10 animate-spin border-[3px]" />
      {text}
    </div>
  );
}
