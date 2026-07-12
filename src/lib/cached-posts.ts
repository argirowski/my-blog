import { unstable_cache } from "next/cache";

import {
  getAllPosts as queryAllPosts,
  getPostById as queryPostById,
} from "@/lib/db";
import { POSTS_LIST_CACHE_TAG, postCacheTag } from "@/lib/post-cache-tags";
import type { BlogPost, BlogPostSummary } from "@/lib/post-types";

/** Align with ISR `revalidate = 60` on public blog routes. */
const POSTS_DATA_REVALIDATE_SEC = 60;

export async function getAllPosts(): Promise<BlogPostSummary[]> {
  return unstable_cache(
    async () => queryAllPosts(),
    ["posts-list"],
    {
      tags: [POSTS_LIST_CACHE_TAG],
      revalidate: POSTS_DATA_REVALIDATE_SEC,
    },
  )();
}

export async function getPostById(id: number): Promise<BlogPost | undefined> {
  if (!Number.isInteger(id) || id < 1) return undefined;

  return unstable_cache(
    async () => queryPostById(id),
    ["post-by-id", String(id)],
    {
      tags: [POSTS_LIST_CACHE_TAG, postCacheTag(id)],
      revalidate: POSTS_DATA_REVALIDATE_SEC,
    },
  )();
}
