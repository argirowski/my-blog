import { z } from "zod";

/** Normalized identifiers before insert */
export function normalizeSignupEmail(email: string) {
  return email.trim().toLowerCase();
}

export function normalizeSignupUsername(username: string) {
  return username.trim();
}

export const registerFormSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(2, "Username must be at least 2 characters")
      .max(32, "Username must be at most 32 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Use only letters, numbers, underscores, and hyphens",
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .refine(
        (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.toLowerCase()),
        "Enter a valid email address",
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters"),
    confirmPassword: z.string().min(1, "Repeat your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
