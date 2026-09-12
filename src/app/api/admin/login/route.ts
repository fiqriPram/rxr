import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, createAdminSession } from "@/lib/admin-auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "admin-login"), 10, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Terlalu banyak percobaan. Tunggu sebentar." },
      { status: 429 }
    );
  }

  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) {
    return NextResponse.json(
      { success: false, error: "ADMIN_PASSWORD belum dikonfigurasi di server." },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const parsed = adminLoginSchema.safeParse(await req.json());
    password = parsed.success ? parsed.data.password : "";
  } catch {
    password = "";
  }

  if (!password || password !== expected) {
    return NextResponse.json({ success: false, error: "Password salah." }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await createAdminSession(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
