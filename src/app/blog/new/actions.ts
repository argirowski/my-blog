"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth-options";
import { insertPost } from "@/lib/db";
import { revalidatePostCaches } from "@/lib/revalidate-post-caches";
import {
  newPostFormSchema,
  type NewPostFormValues,
} from "@/lib/post-form-schema";

export type CreatePostActionResult =
  | { success: true; id: number }
  | {
      success: false;
      unauthorized?: true;
      fieldErrors?: Partial<Record<keyof NewPostFormValues, string[]>>;
    };

export async function createPostAction(
  input: NewPostFormValues,
): Promise<CreatePostActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, unauthorized: true };
  }

  const authorUserId = Number(session.user.id);
  if (!Number.isSafeInteger(authorUserId) || authorUserId < 1) {
    return { success: false, unauthorized: true };
  }

  const parsed = newPostFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof NewPostFormValues, string[]>> =
      {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key !== "string") continue;
      const field = key as keyof NewPostFormValues;
      const list = fieldErrors[field] ?? [];
      list.push(issue.message);
      fieldErrors[field] = list;
    }
    return { success: false, fieldErrors };
  }

  const data = parsed.data;
  const id = insertPost({
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    publishedAt: data.publishedAt,
    authorUserId,
  });

  revalidatePostCaches(id);

  return { success: true, id };
}
