"use server";

import bcrypt from "bcryptjs";

import {
  CredentialUserConflictError,
  insertCredentialUser,
  rowExistsCredentialUserLookup,
} from "@/lib/db";
import {
  normalizeSignupEmail,
  normalizeSignupUsername,
  registerFormSchema,
  type RegisterFormValues,
} from "@/lib/register-schema";

const BCRYPT_ROUNDS = 12;

export type RegisterActionResult =
  | { success: true }
  | {
      success: false;
      fieldErrors?: Partial<Record<keyof RegisterFormValues, string[]>>;
      message?: string;
    };

export async function registerAction(
  input: RegisterFormValues,
): Promise<RegisterActionResult> {
  const parsed = registerFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof RegisterFormValues, string[]>> =
      {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key !== "string") continue;
      const field = key as keyof RegisterFormValues;
      const list = fieldErrors[field] ?? [];
      list.push(issue.message);
      fieldErrors[field] = list;
    }
    return { success: false, fieldErrors };
  }

  const data = parsed.data;
  const email = normalizeSignupEmail(data.email);
  const username = normalizeSignupUsername(data.username);

  const { emailTaken, usernameTaken } =
    rowExistsCredentialUserLookup(email, username);

  if (emailTaken || usernameTaken) {
    const fieldErrors: Partial<Record<keyof RegisterFormValues, string[]>> =
      {};
    if (emailTaken) {
      fieldErrors.email = ["This email is already registered"];
    }
    if (usernameTaken) {
      fieldErrors.username = ["This username is already taken"];
    }
    return { success: false, fieldErrors };
  }

  try {
    const passwordHash = bcrypt.hashSync(data.password, BCRYPT_ROUNDS);
    insertCredentialUser({ email, username, passwordHash });
  } catch (e: unknown) {
    if (e instanceof CredentialUserConflictError) {
      return {
        success: false,
        message: "That email or username is already registered.",
      };
    }
    throw e;
  }

  return { success: true };
}
