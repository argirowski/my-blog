import { z } from "zod";

const publishedAtBase = z
  .string()
  .min(1, "Publication date is required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD)");

const sharedPostFields = {
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(30, "Title must be at most 30 characters"),
  excerpt: z
    .string()
    .trim()
    .min(3, "Excerpt must be at least 3 characters")
    .max(100, "Excerpt must be at most 100 characters"),
  content: z.string().trim().min(1, "Content is required"),
};

export const newPostFormSchema = z.object({
  ...sharedPostFields,
  publishedAt: publishedAtBase.refine(
    (s) => s >= todayIsoDate(),
    "Publication date cannot be in the past",
  ),
});

export type NewPostFormValues = z.infer<typeof newPostFormSchema>;

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
