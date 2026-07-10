import type { NextResponse } from "next/server";

import {
  REFRESH_TOKEN_MAX_AGE_SEC,
  SESSION_COOKIE_MAX_AGE_SEC,
} from "@/lib/session-durations";

function secureCookiesDefault(): boolean {
  if (process.env.NEXTAUTH_URL?.startsWith("https://")) return true;
  if (process.env.VERCEL) return true;
  return false;
}

export function cookieSecureBool(): boolean {
  return process.env.AUTH_COOKIE_SECURE_OVERRIDE === "0"
    ? false
    : secureCookiesDefault();
}

export type CookiePack = {
  name: string;
  value: string;
  options: {
    httpOnly: boolean;
    sameSite: "lax";
    path: string;
    secure: boolean;
    maxAge: number;
  };
};

/** Reflects NextAuth’s default naming for the encrypted session JWT. */
export function nextAuthSessionTokenCookiePack(jwt: string): CookiePack {
  const secure = cookieSecureBool();
  const name = secure ? "__Secure-next-auth.session-token" : "next-auth.session-token";
  return {
    name,
    value: jwt,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      maxAge: SESSION_COOKIE_MAX_AGE_SEC,
    },
  };
}

/** HttpOnly opaque refresh cookie aligned with SQLite `refresh_tokens`. */
export function refreshTokenCookiePack(rawRefresh: string): CookiePack {
  const secure = cookieSecureBool();
  const name = secure ? "__Secure-blog.refresh-token" : "blog.refresh-token";
  return {
    name,
    value: rawRefresh,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
    },
  };
}

export function setSessionJwtOnResponse(response: NextResponse, jwt: string) {
  const p = nextAuthSessionTokenCookiePack(jwt);
  response.cookies.set(p.name, p.value, p.options);
}

export function setRefreshOnResponse(
  response: NextResponse,
  rawRefresh: string,
) {
  const p = refreshTokenCookiePack(rawRefresh);
  response.cookies.set(p.name, p.value, p.options);
}

export function clearRefreshOnResponse(response: NextResponse) {
  const p = refreshTokenCookiePack("");
  response.cookies.set(p.name, "", { ...p.options, maxAge: 0 });
}

/** Incoming request cookie names for clients that read `cookies` / `Cookie`. */
export function refreshTokenCookieKey(): string {
  return cookieSecureBool()
    ? "__Secure-blog.refresh-token"
    : "blog.refresh-token";
}
