"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeletePostConfirmDialog } from "@/components/delete-post-confirm-dialog";
import { markRouteNavigating } from "@/components/navigation-loader";
import { NavigatingLink } from "@/components/navigating-link";

type Props = {
  postId: number;
};

export function PostDetailActions({ postId }: Props) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <NavigatingLink
          href={`/blog/${postId}/edit`}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Edit
        </NavigatingLink>
        <button
          type="button"
          onClick={() => setDeleteDialogOpen(true)}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:bg-zinc-950 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Delete
        </button>
      </div>

      <DeletePostConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        postId={postId}
        onSuccess={() => {
          markRouteNavigating();
          router.push("/blog?postDeleted=1");
        }}
      />
    </>
  );
}
