"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth-options";
import { getPostById, updatePostOwnedBy } from "@/lib/posts";
import {
  newPostFormSchema,
  type NewPostFormValues,
} from "@/lib/post-form-schema";

export type UpdatePostActionResult =
  | { success: true }
  | {
      success: false;
      notFound?: true;
      unauthorized?: true;
      fieldErrors?: Partial<Record<keyof NewPostFormValues, string[]>>;
    };

export async function updatePostAction(
  postId: number,
  input: NewPostFormValues,
): Promise<UpdatePostActionResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, unauthorized: true };
  }

  const ownerUserId = Number(session.user.id);
  if (!Number.isSafeInteger(ownerUserId) || ownerUserId < 1) {
    return { success: false, unauthorized: true };
  }

  if (!Number.isInteger(postId) || postId < 1) {
    return { success: false, notFound: true };
  }

  const existing = getPostById(postId);
  if (!existing) {
    return { success: false, notFound: true };
  }

  if (
    existing.authorUserId == null ||
    existing.authorUserId !== ownerUserId
  ) {
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
  const ok = updatePostOwnedBy(postId, ownerUserId, {
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    publishedAt: data.publishedAt,
  });

  if (!ok) {
    return { success: false, notFound: true };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${postId}`);

  return { success: true };
}
