/** NextAuth JWT session cookie lifetime (seconds). */
export const SESSION_COOKIE_MAX_AGE_SEC = 60 * 60;

/** Sliding lifetime for SQLite-backed refresh tokens (seconds). Extended on rotate. */
export const REFRESH_TOKEN_MAX_AGE_SEC = 30 * 24 * 60 * 60;
