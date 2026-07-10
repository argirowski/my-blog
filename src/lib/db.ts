import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { join } from "path";

import {
  createRefreshTokenRaw,
  hashRefreshToken,
} from "@/lib/refresh-token-crypto";
import { SEED_POSTS } from "@/lib/post-seed";
import type { BlogPost, BlogPostSummary } from "@/lib/post-types";
import { REFRESH_TOKEN_MAX_AGE_SEC } from "@/lib/session-durations";
import {
  getSharedSeedAuthorPasswordHash,
  SEED_BLOG_AUTHOR_USERS,
} from "@/lib/user-seed";

const globalForSqlite = globalThis as typeof globalThis & {
  __blogSqlite?: Database.Database;
};

const DATA_DIR = join(process.cwd(), "data");
const DB_PATH = join(DATA_DIR, "blog.db");

/** Row shape returned from list/detail queries (`author` resolves via FK when present). */
type PostJoinedRowCore = {
  id: number;
  title: string;
  excerpt: string;
  published_at: string;
  author: string;
  user_id: number | null;
};

type PostSummaryRow = PostJoinedRowCore;
type PostRow = PostJoinedRowCore & { content: string };

function rowCoreToSummary(core: PostJoinedRowCore): BlogPostSummary {
  return {
    id: core.id,
    title: core.title,
    excerpt: core.excerpt,
    publishedAt: core.published_at,
    author: core.author,
    authorUserId: core.user_id,
  };
}

const LEGACY_AUTHOR_TO_USERNAME: Record<string, string> = {
  "Maya Chen": "maya_chen",
  "Jordan Lee": "jordan_lee",
  "Sam Rivera": "sam_rivera",
  "Alex Kim": "alex_kim",
  "Riley Park": "riley_park",
};

/** Posts whose author string cannot be matched migrate under this synthetic account. */
const CATCHALL_POST_OWNER = {
  username: "legacy_import",
  email: "legacy_import@blog.seed",
} as const;

function ensurePostsUserIdColumn(db: Database.Database) {
  const columns = db.prepare(`PRAGMA table_info(posts)`).all() as {
    name: string;
  }[];
  if (columns.some((c) => c.name === "user_id")) return;
  db.exec(`ALTER TABLE posts ADD COLUMN user_id INTEGER;`);
}

function ensureSeedBlogAuthorUsers(db: Database.Database) {
  const hash = getSharedSeedAuthorPasswordHash();
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO users (email, username, password_hash)
     VALUES (@email, @username, @passwordHash)`,
  );
  const run = db.transaction(() => {
    for (const row of SEED_BLOG_AUTHOR_USERS) {
      stmt.run({
        email: row.email.trim().toLowerCase(),
        username: row.username,
        passwordHash: hash,
      });
    }
  });
  run();
}

function remapLegacyPostAuthors(db: Database.Database) {
  const stmt = db.prepare(`UPDATE posts SET author = @slug WHERE author = @legacy`);
  for (const [legacy, slug] of Object.entries(LEGACY_AUTHOR_TO_USERNAME)) {
    stmt.run({ slug, legacy });
  }
}

function backfillPostsUserIdsFromAuthors(db: Database.Database) {
  db.exec(`
    UPDATE posts
    SET user_id = (
      SELECT u.id FROM users AS u WHERE u.username = posts.author COLLATE NOCASE LIMIT 1
    )
    WHERE user_id IS NULL
  `);
}

function assignCatchAllPostOwners(db: Database.Database) {
  const pending =
    (
      db
        .prepare(`SELECT COUNT(*) AS c FROM posts WHERE user_id IS NULL`)
        .get() as { c: number }
    ).c;
  if (pending === 0) return;

  const hash = getSharedSeedAuthorPasswordHash();
  db.prepare(
    `INSERT OR IGNORE INTO users (email, username, password_hash)
     VALUES (@email, @username, @passwordHash)`,
  ).run({
    email: CATCHALL_POST_OWNER.email,
    username: CATCHALL_POST_OWNER.username,
    passwordHash: hash,
  });

  const row = db
    .prepare(`SELECT id FROM users WHERE username = ? COLLATE NOCASE LIMIT 1`)
    .get(CATCHALL_POST_OWNER.username) as { id: number } | undefined;
  if (!row) throw new Error("assignCatchAllPostOwners: synthetic owner missing");

  db.prepare(`UPDATE posts SET user_id = ?, author = ? WHERE user_id IS NULL`).run(
    row.id,
    CATCHALL_POST_OWNER.username,
  );
}

/** Adds `posts.user_id`, seeds demo authors for SQL seeds, repairs legacy installs. */
function syncPostsOwnerLinks(db: Database.Database) {
  ensurePostsUserIdColumn(db);
  ensureSeedBlogAuthorUsers(db);
  remapLegacyPostAuthors(db);
  backfillPostsUserIdsFromAuthors(db);
  assignCatchAllPostOwners(db);
}

function ensurePostsTable(db: Database.Database) {
  const exists = db
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name='posts'`,
    )
    .get() as { name: string } | undefined;

  if (!exists) {
    db.exec(`
      CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        published_at TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL
      );
    `);
    return;
  }

  const columns = db.prepare(`PRAGMA table_info(posts)`).all() as {
    name: string;
  }[];
  const hasAuthor = columns.some((c) => c.name === "author");
  if (!hasAuthor) {
    db.exec(
      `ALTER TABLE posts ADD COLUMN author TEXT NOT NULL DEFAULT 'alex_kim'`,
    );
  }

  const hasId = columns.some((c) => c.name === "id");
  if (hasId) return;

  const migrate = db.transaction(() => {
    db.exec(`
      CREATE TABLE posts_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        published_at TEXT NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER
      );
    `);
    db.exec(`
      INSERT INTO posts_new (title, excerpt, published_at, author, content, user_id)
      SELECT title, excerpt, published_at, author, content, NULL
      FROM posts;
    `);
    db.exec(`DROP TABLE posts;`);
    db.exec(`ALTER TABLE posts_new RENAME TO posts;`);
  });
  migrate();
}

type CredentialUserRow = {
  id: number;
  email: string;
  username: string;
  password_hash: string;
};

function ensureUsersTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function ensureRefreshTokensTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
  `);
}

/** Read-only gateway before minting a new access JWT — pair with finalizeRefreshRotate. */
export function peekValidRefreshOwnerUserId(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const db = getDb();
  try {
    const hashed = hashRefreshToken(trimmed);
    const row = db
      .prepare(
        `SELECT user_id FROM refresh_tokens
         WHERE token_hash = ?
           AND expires_at > CAST(strftime('%s', 'now') AS INTEGER)`,
      )
      .get(hashed) as { user_id: number } | undefined;
    return row?.user_id ?? null;
  } catch {
    return null;
  }
}

/**
 * One-time redemption of `raw` → new opaque token stored in SQLite.
 * Call **after** a new encrypted session JWT is minted successfully.
 */
export function finalizeRefreshRotate(raw: string): {
  rawToken: string;
} | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const db = getDb();
  let hashed: string;
  try {
    hashed = hashRefreshToken(trimmed);
  } catch {
    return null;
  }

  try {
    return db.transaction((): {
      rawToken: string;
    } | null => {
      const row = db
        .prepare(
          `SELECT user_id FROM refresh_tokens
           WHERE token_hash = ?
             AND expires_at > CAST(strftime('%s', 'now') AS INTEGER)`,
        )
        .get(hashed) as { user_id: number } | undefined;
      if (!row) return null;

      db.prepare(`DELETE FROM refresh_tokens WHERE token_hash = ?`).run(hashed);

      const rawNext = createRefreshTokenRaw();
      const hashNext = hashRefreshToken(rawNext);
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = now + REFRESH_TOKEN_MAX_AGE_SEC;

      db.prepare(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
         VALUES (@user_id, @token_hash, @expires_at, @created_at)`,
      ).run({
        user_id: row.user_id,
        token_hash: hashNext,
        expires_at: expiresAt,
        created_at: now,
      });

      return { rawToken: rawNext };
    })();
  } catch {
    return null;
  }
}

export function persistNewRefreshTokenForUser(userId: number): {
  rawToken: string;
} {
  if (!Number.isInteger(userId) || userId < 1) {
    throw new Error("persistNewRefreshTokenForUser: invalid user id");
  }
  const db = getDb();
  const raw = createRefreshTokenRaw();
  const tokenHash = hashRefreshToken(raw);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + REFRESH_TOKEN_MAX_AGE_SEC;
  db.prepare(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at)
     VALUES (@user_id, @token_hash, @expires_at, @created_at)`,
  ).run({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_at: now,
  });
  return { rawToken: raw };
}

/** Removes the row backing this opaque cookie value, if present. */
export function revokeRefreshTokenByRaw(raw: string): void {
  const trimmed = raw.trim();
  if (!trimmed) return;
  const db = getDb();
  try {
    const hash = hashRefreshToken(trimmed);
    db.prepare(`DELETE FROM refresh_tokens WHERE token_hash = ?`).run(hash);
  } catch {
    /* ignore hash/token errors */
  }
}

export function revokeAllRefreshTokensForUser(userId: number): void {
  if (!Number.isInteger(userId) || userId < 1) return;
  const db = getDb();
  db.prepare(`DELETE FROM refresh_tokens WHERE user_id = ?`).run(userId);
}

export function getCredentialUserBasicsById(
  id: number,
): { id: number; email: string; username: string } | undefined {
  if (!Number.isInteger(id) || id < 1) return undefined;
  const db = getDb();
  return db
    .prepare(`SELECT id, email, username FROM users WHERE id = ? LIMIT 1`)
    .get(id) as { id: number; email: string; username: string } | undefined;
}

/** `emailNormalized` — trimmed, lowercase. */
export function findCredentialUserByEmail(
  emailNormalized: string,
): CredentialUserRow | undefined {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, email, username, password_hash FROM users WHERE email = ?`,
    )
    .get(emailNormalized) as CredentialUserRow | undefined;
}

export function insertCredentialUser(input: {
  email: string;
  username: string;
  passwordHash: string;
}): number {
  const db = getDb();
  try {
    const result = db
      .prepare(
        `INSERT INTO users (email, username, password_hash)
         VALUES (@email, @username, @passwordHash)`,
      )
      .run({
        email: input.email,
        username: input.username,
        passwordHash: input.passwordHash,
      });
    return Number(result.lastInsertRowid);
  } catch (e: unknown) {
    const msg = String(e ?? "");
    if (msg.includes("UNIQUE constraint failed")) {
      throw new CredentialUserConflictError(msg);
    }
    throw e;
  }
}

export class CredentialUserConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CredentialUserConflictError";
  }
}

export function rowExistsCredentialUserLookup(
  emailNormalized: string,
  usernameNormalized: string,
): { emailTaken: boolean; usernameTaken: boolean } {
  const db = getDb();
  const emailTaken = !!db
    .prepare(`SELECT 1 FROM users WHERE email = ? LIMIT 1`)
    .get(emailNormalized);
  const usernameTaken = !!db
    .prepare(`SELECT 1 FROM users WHERE username = ? COLLATE NOCASE LIMIT 1`)
    .get(usernameNormalized);
  return {
    emailTaken: !!emailTaken,
    usernameTaken: !!usernameTaken,
  };
}

function getDb(): Database.Database {
  const created = !globalForSqlite.__blogSqlite;
  if (created) {
    mkdirSync(DATA_DIR, { recursive: true });
    globalForSqlite.__blogSqlite = new Database(DB_PATH);
    globalForSqlite.__blogSqlite.pragma("journal_mode = WAL");
  }

  const db = globalForSqlite.__blogSqlite!;
  db.pragma("foreign_keys = ON");
  // Run on every access so migrations apply after hot reload (connection is cached on globalThis).
  ensurePostsTable(db);
  ensureUsersTable(db);
  ensureRefreshTokensTable(db);
  syncPostsOwnerLinks(db);

  if (created) {
    seedIfEmpty(db);
  }

  return db;
}

function seedIfEmpty(db: Database.Database) {
  const count = (
    db.prepare("SELECT COUNT(*) as c FROM posts").get() as { c: number }
  ).c;
  if (count > 0) return;

  const seen = new Set<number>();
  for (const row of SEED_POSTS) {
    if (seen.has(row.id)) {
      throw new Error(`post-seed: duplicate id ${row.id}`);
    }
    seen.add(row.id);
  }

  const insert = db.prepare(
    `INSERT INTO posts (id, title, excerpt, published_at, author, content, user_id)
     VALUES (@id, @title, @excerpt, @publishedAt, @author, @content, @user_id)`,
  );

  const authorToId = db.prepare(
    `SELECT id FROM users WHERE username = ? COLLATE NOCASE LIMIT 1`,
  );

  const runSeed = db.transaction((rows: typeof SEED_POSTS) => {
    for (const row of rows) {
      const uid = authorToId.get(row.author) as { id: number } | undefined;
      if (!uid) {
        throw new Error(
          `post-seed: no user matching author "${row.author}" — sync seed authors first`,
        );
      }
      insert.run({
        ...row,
        user_id: uid.id,
      });
    }
  });
  runSeed(SEED_POSTS);
}

function rowToPost(row: PostRow): BlogPost {
  return { ...rowCoreToSummary(row), content: row.content };
}

export function getAllPosts(): BlogPostSummary[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.id AS id,
              p.title AS title,
              p.excerpt AS excerpt,
              p.published_at AS published_at,
              COALESCE(u.username, p.author) AS author,
              p.user_id AS user_id
       FROM posts AS p
       LEFT JOIN users AS u ON u.id = p.user_id
       ORDER BY p.published_at DESC`,
    )
    .all() as PostSummaryRow[];

  return rows.map(rowCoreToSummary);
}

export function getPostById(id: number): BlogPost | undefined {
  if (!Number.isInteger(id) || id < 1) return undefined;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT p.id AS id,
              p.title AS title,
              p.excerpt AS excerpt,
              p.published_at AS published_at,
              COALESCE(u.username, p.author) AS author,
              p.user_id AS user_id,
              p.content AS content
       FROM posts AS p
       LEFT JOIN users AS u ON u.id = p.user_id
       WHERE p.id = ?`,
    )
    .get(id) as PostRow | undefined;

  return row ? rowToPost(row) : undefined;
}

/** Fields shared between create/update (author & owner come from signed-in session). */
export type PostContentFields = {
  title: string;
  excerpt: string;
  publishedAt: string;
  content: string;
};

export type InsertPostInput = PostContentFields & { authorUserId: number };

/** Inserts a post and returns the new row id (sets `author` = username). */
export function insertPost(post: InsertPostInput): number {
  const db = getDb();
  const user = db
    .prepare(`SELECT username FROM users WHERE id = ?`)
    .get(post.authorUserId) as { username: string } | undefined;
  if (!user) {
    throw new Error(`insertPost: no user row for id=${post.authorUserId}`);
  }
  const result = db
    .prepare(
      `INSERT INTO posts (title, excerpt, published_at, author, content, user_id)
       VALUES (@title, @excerpt, @publishedAt, @author, @content, @userId)`,
    )
    .run({
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      author: user.username,
      content: post.content,
      userId: post.authorUserId,
    });
  return Number(result.lastInsertRowid);
}

export type UpdatePostPayload = PostContentFields;

/** Updates content fields when `user_id` matches (does not transfer ownership). */
export function updatePostOwnedBy(
  postId: number,
  ownerUserId: number,
  post: UpdatePostPayload,
): boolean {
  if (!Number.isInteger(postId) || postId < 1) return false;
  if (!Number.isInteger(ownerUserId) || ownerUserId < 1) return false;
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE posts
       SET title = @title, excerpt = @excerpt, published_at = @publishedAt, content = @content
       WHERE id = @id AND user_id = @ownerId`,
    )
    .run({
      id: postId,
      ownerId: ownerUserId,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      content: post.content,
    });
  return result.changes > 0;
}

/** Deletes when `user_id` matches. */
export function deletePostOwnedBy(postId: number, ownerUserId: number): boolean {
  if (!Number.isInteger(postId) || postId < 1) return false;
  if (!Number.isInteger(ownerUserId) || ownerUserId < 1) return false;
  const db = getDb();
  const result = db
    .prepare(`DELETE FROM posts WHERE id = ? AND user_id = ?`)
    .run(postId, ownerUserId);
  return result.changes > 0;
}
