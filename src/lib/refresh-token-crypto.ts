import { createHash, randomBytes } from "crypto";

export function createRefreshTokenRaw(): string {
  return randomBytes(32).toString("base64url");
}

/** HMAC-ish keyed hash stored in SQLite; never persist the plaintext token. */
export function hashRefreshToken(raw: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required to hash refresh tokens");
  }
  return createHash("sha256")
    .update(secret, "utf8")
    .update("|")
    .update(raw, "utf8")
    .digest("hex");
}
