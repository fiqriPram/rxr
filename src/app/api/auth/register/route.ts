import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/db/repo";
import {
  USER_COOKIE_NAME,
  createUserSession,
  hashPassword,
  isValidEmail,
} from "@/lib/user-auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "user-register"), 10, 60 * 1000)) {
    return NextResponse.json(
      { success: false, error: "Terlalu banyak percobaan. Tunggu sebentar." },
      { status: 429 }
    );
  }
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, error: "Nama minimal 2 karakter." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Format email tidak valid." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password minimal 6 karakter." }, { status: 400 });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ success: false, error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
    }

    const user = await createUser({ name, email, phone: phone || undefined, passwordHash: hashPassword(password) });
    if (!user) {
      return NextResponse.json({ success: false, error: "Database belum dikonfigurasi. Coba lagi nanti." }, { status: 503 });
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
    console.error("Register error:", error);
    return NextResponse.json({ success: false, error: "Gagal mendaftar." }, { status: 500 });
  }
}
