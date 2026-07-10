import { NextResponse, type NextRequest } from "next/server";

import {
  clearRefreshOnResponse,
  refreshTokenCookieKey,
  setRefreshOnResponse,
  setSessionJwtOnResponse,
} from "@/lib/auth-cookies";
import {
  finalizeRefreshRotate,
  getCredentialUserBasicsById,
  peekValidRefreshOwnerUserId,
} from "@/lib/db";
import { mintNextAuthSessionJwtValue } from "@/lib/mint-nextauth-session-token";

export async function POST(request: NextRequest) {
  const raw = request.cookies.get(refreshTokenCookieKey())?.value ?? null;
  const fail = (
    status: number,
    body: Record<string, string>,
    clearRefresh: boolean,
  ) => {
    const res = NextResponse.json(body, { status });
    if (clearRefresh) clearRefreshOnResponse(res);
    return res;
  };

  if (!raw?.trim()) {
    return fail(401, { error: "NO_REFRESH_COOKIE" }, true);
  }

  const ownerId = peekValidRefreshOwnerUserId(raw);
  if (ownerId == null) {
    return fail(401, { error: "INVALID_OR_EXPIRED_REFRESH" }, true);
  }

  const user = getCredentialUserBasicsById(ownerId);
  if (!user) {
    return fail(401, { error: "INVALID_OR_EXPIRED_REFRESH" }, true);
  }

  let jwt: string;
  try {
    jwt = await mintNextAuthSessionJwtValue(user);
  } catch {
    return NextResponse.json(
      { error: "SESSION_ISSUE_RETRY_SIGN_IN" },
      { status: 500 },
    );
  }

  const spun = finalizeRefreshRotate(raw);
  if (!spun) {
    return NextResponse.json(
      { error: "REFRESH_ROTATE_CONTENTION_RETRY" },
      { status: 503 },
    );
  }

  const res = NextResponse.json({ ok: true });
  setSessionJwtOnResponse(res, jwt);
  setRefreshOnResponse(res, spun.rawToken);
  return res;
}
