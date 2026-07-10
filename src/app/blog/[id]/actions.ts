"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth-options";
import { deletePostOwnedBy, getPostById } from "@/lib/posts";

export type DeletePostResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "not_found" | "forbidden" | "auth" };

export async function deletePostAction(id: number): Promise<DeletePostResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false, error: "auth" };
  }

  const ownerUserId = Number(session.user.id);
  if (!Number.isSafeInteger(ownerUserId) || ownerUserId < 1) {
    return { ok: false, error: "auth" };
  }

  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, error: "invalid" };
  }

  const existing = getPostById(id);
  if (!existing) {
    return { ok: false, error: "not_found" };
  }
  if (
    existing.authorUserId == null ||
    existing.authorUserId !== ownerUserId
  ) {
    return { ok: false, error: "forbidden" };
  }

  const deleted = deletePostOwnedBy(id, ownerUserId);
  if (!deleted) {
    return { ok: false, error: "not_found" };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
  return { ok: true };
}
