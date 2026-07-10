import { encode } from "next-auth/jwt";

import { SESSION_COOKIE_MAX_AGE_SEC } from "@/lib/session-durations";

/** Same shape produced by Credentials sign-in (encrypted JWT, session strategy). */
export async function mintNextAuthSessionJwtValue(user: {
  id: number;
  email: string;
  username: string;
}) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required to mint sessions");
  }
  return encode({
    secret,
    token: {
      sub: String(user.id),
      name: user.username,
      email: user.email,
    },
    maxAge: SESSION_COOKIE_MAX_AGE_SEC,
  });
}
