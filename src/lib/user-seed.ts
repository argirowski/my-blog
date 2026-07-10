/**
 * Rows inserted (if missing) so seeded posts can reference `users(id)`.
 *
 * Username must match signup rules (`[a-zA-Z0-9_-]+`) and align with seed post
 * `author` strings in `post-seed.ts`.
 *
 * Same password hash for each row — dev/demo only (`SeedBlogAuthors!demo1`).
 */
import bcrypt from "bcryptjs";

const SEED_ROUND = 12;
const SHARED_SEED_PASSWORD = "SeedBlogAuthors!demo1";

export type SeedBlogAuthorUser = {
  username: string;
  email: string;
};

/** `password_hash` is computed once when this module loads. */
const SHARED_PASSWORD_HASH = bcrypt.hashSync(
  SHARED_SEED_PASSWORD,
  SEED_ROUND,
);

export const SEED_BLOG_AUTHOR_USERS: SeedBlogAuthorUser[] = [
  { username: "maya_chen", email: "maya_chen@blog.seed" },
  { username: "jordan_lee", email: "jordan_lee@blog.seed" },
  { username: "sam_rivera", email: "sam_rivera@blog.seed" },
  { username: "alex_kim", email: "alex_kim@blog.seed" },
  { username: "riley_park", email: "riley_park@blog.seed" },
];

export function getSharedSeedAuthorPasswordHash() {
  return SHARED_PASSWORD_HASH;
}
