import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth-options";
import { setRefreshOnResponse } from "@/lib/auth-cookies";
import { persistNewRefreshTokenForUser } from "@/lib/db";

export async function POST() {
  const session = await getServerSession(authOptions);
  const rawUserId = session?.user?.id;

  const userId =
    typeof rawUserId === "string"
      ? Number(rawUserId)
      : typeof rawUserId === "number"
        ? rawUserId
        : NaN;

  if (!Number.isFinite(userId) || userId < 1) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { rawToken } = persistNewRefreshTokenForUser(userId);
    const res = NextResponse.json({ ok: true });
    setRefreshOnResponse(res, rawToken);
    return res;
  } catch {
    return NextResponse.json(
      { error: "BOOTSTRAP_FAILED" },
      { status: 500 },
    );
  }
}
