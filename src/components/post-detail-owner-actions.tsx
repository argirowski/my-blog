"use client";

import { useSession } from "next-auth/react";

import { PostDetailActions } from "@/components/post-detail-actions";

type Props = {
  postId: number;
  authorUserId: number | null;
};

export function PostDetailOwnerActions({ postId, authorUserId }: Props) {
  const { data: session } = useSession();

  if (authorUserId == null) return null;

  const viewerRaw = session?.user?.id ? Number(session.user.id) : NaN;
  const viewerId =
    Number.isInteger(viewerRaw) && viewerRaw >= 1 ? viewerRaw : NaN;
  const canModifyPost =
    Number.isInteger(viewerId) && viewerId === authorUserId;

  if (!canModifyPost) return null;

  return <PostDetailActions postId={postId} />;
}
