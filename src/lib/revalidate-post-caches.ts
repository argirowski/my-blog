import { revalidatePath, revalidateTag } from "next/cache";

import { POSTS_LIST_CACHE_TAG, postCacheTag } from "@/lib/post-cache-tags";

/** Next.js 16: `revalidateTag` requires a cache-life profile (e.g. `"max"`). */
const TAG_REVALIDATE_PROFILE = "max";

/**
 * After a post mutation, bust tagged Data Cache entries and ISR route caches.
 * Called from blog Server Actions (create / update / delete).
 */
export function revalidatePostCaches(postId: number): void {
  revalidateTag(POSTS_LIST_CACHE_TAG, TAG_REVALIDATE_PROFILE);
  revalidateTag(postCacheTag(postId), TAG_REVALIDATE_PROFILE);
  revalidatePath("/blog");
  revalidatePath(`/blog/${postId}`);
}
