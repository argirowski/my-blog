/** Data Cache tag for the post list (`getAllPosts`). */
export const POSTS_LIST_CACHE_TAG = "posts";

/** Data Cache tag for one post (`getPostById`). */
export function postCacheTag(postId: number): string {
  return `post-${postId}`;
}
