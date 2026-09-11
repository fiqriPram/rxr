import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/db/repo";
import { USER_COOKIE_NAME, createUserSession, verifyPassword } from "@/lib/user-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const user = await getUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ success: false, error: "Email atau password salah." }, { status: 401 });
    }

    const res = NextResponse.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
    res.cookies.set(USER_COOKIE_NAME, await createUserSession(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Gagal masuk." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(USER_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
