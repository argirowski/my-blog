import { getServerSession } from "next-auth";
import { NextResponse, type NextRequest } from "next/server";

import { authOptions } from "@/lib/auth-options";
import {
  clearRefreshOnResponse,
  refreshTokenCookieKey,
} from "@/lib/auth-cookies";
import {
  revokeAllRefreshTokensForUser,
  revokeRefreshTokenByRaw,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  let revokeAll = false;
  try {
    const body = await req.json();
    revokeAll = Boolean(body?.revokeAll);
  } catch {
    // empty body acceptable
  }

  const cookieRaw = req.cookies.get(refreshTokenCookieKey())?.value ?? "";

  if (revokeAll) {
    const session = await getServerSession(authOptions);
    const rawUid = session?.user?.id;
    const uid =
      typeof rawUid === "string"
        ? Number(rawUid)
        : typeof rawUid === "number"
          ? rawUid
          : NaN;
    if (Number.isFinite(uid) && uid > 0) {
      revokeAllRefreshTokensForUser(uid);
    }
  }

  if (cookieRaw.trim()) revokeRefreshTokenByRaw(cookieRaw);

  const res = NextResponse.json({ ok: true });
  clearRefreshOnResponse(res);
  return res;
}
