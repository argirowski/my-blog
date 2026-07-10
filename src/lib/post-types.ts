export type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  publishedAt: string;
  /** Mirrors `users.username` for `authorUserId` (denormalised for SQLite simplicity). */
  author: string;
  /** FK to `users.id`. Null should not occur after DB migrations unless data was edited offline. */
  authorUserId: number | null;
  content: string;
};

export type BlogPostSummary = Omit<BlogPost, "content">;
