"use client";

import { format, parse, isValid, startOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

import "react-day-picker/style.css";

const labelClass =
  "mb-1 block text-sm font-medium text-foreground";
const triggerClass =
  "flex h-10 w-full max-w-xs items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-zinc-500";
const popoverClass =
  "absolute left-0 top-full z-50 mt-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  disabled?: boolean;
  /** When false, any calendar day can be chosen (e.g. editing an existing post). @default true */
  disablePastDates?: boolean;
};

function parseIsoDateOnly(s: string): Date | undefined {
  if (!s?.trim()) return undefined;
  const d = parse(s.trim(), "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export function PublicationDatePicker({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  disablePastDates = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selected = parseIsoDateOnly(value);
  const errId = `${id}-error`;

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur();
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open, onBlur]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        onBlur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onBlur]);

  const displayLabel =
    selected != null
      ? format(selected, "PPP", { locale: enUS })
      : "Pick a date";

  return (
    <div className="relative sm:max-w-xs" ref={wrapRef}>
      <label htmlFor={`${id}-button`} className={labelClass}>
        {label}
      </label>
      <button
        id={`${id}-button`}
        type="button"
        disabled={disabled}
        className={triggerClass}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((o) => !o)}
      >
        <span className={selected ? "" : "text-zinc-400"}>{displayLabel}</span>
        <span className="text-zinc-400" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          className={popoverClass}
          role="dialog"
          aria-label="Choose publication date"
        >
          <DayPicker
            mode="single"
            navLayout="around"
            {...(disablePastDates
              ? { disabled: { before: startOfDay(new Date()) } }
              : {})}
            selected={selected}
            onSelect={(date) => {
              if (!date) return;
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
              onBlur();
            }}
            defaultMonth={selected ?? new Date()}
            locale={enUS}
            classNames={{
              root: [
                "rdp-root",
                "[--rdp-accent-color:theme(colors.zinc.600)]",
                "[--rdp-accent-background-color:theme(colors.zinc.100)]",
                "dark:[--rdp-accent-color:theme(colors.zinc.400)]",
                "dark:[--rdp-accent-background-color:theme(colors.zinc.800)]",
              ].join(" "),
              months: "rdp-months relative flex flex-col gap-4 sm:flex-row",
              month: "rdp-month",
              month_caption:
                "rdp-month_caption flex h-9 items-center justify-center px-1 text-sm font-medium text-foreground",
              button_previous:
                "rdp-button_previous inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-foreground hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
              button_next:
                "rdp-button_next inline-flex size-9 items-center justify-center rounded-lg border border-zinc-200 text-foreground hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
              month_grid: "rdp-month_grid mt-2 w-full border-collapse",
              weekdays: "rdp-weekdays",
              weekday:
                "rdp-weekday w-9 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400",
              week: "rdp-week",
              day: [
                "rdp-day p-0 text-center text-sm",
                "[&[data-selected]_.rdp-day_button]:border-transparent",
                "[&[data-selected]_.rdp-day_button]:!bg-zinc-900",
                "[&[data-selected]_.rdp-day_button]:!text-white",
                "[&[data-selected]_.rdp-day_button]:hover:!bg-zinc-800",
                "dark:[&[data-selected]_.rdp-day_button]:!bg-zinc-100",
                "dark:[&[data-selected]_.rdp-day_button]:!text-zinc-900",
                "dark:[&[data-selected]_.rdp-day_button]:hover:!bg-zinc-200",
              ].join(" "),
              day_button:
                "rdp-day_button mx-auto flex size-9 items-center justify-center rounded-lg text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800",
              selected: "rdp-selected font-semibold",
              today: "rdp-today font-semibold text-foreground",
              disabled: "rdp-disabled text-zinc-300 dark:text-zinc-600",
              outside: "rdp-outside text-zinc-400 opacity-60",
            }}
          />
        </div>
      ) : null}

      {error ? (
        <p id={errId} className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
