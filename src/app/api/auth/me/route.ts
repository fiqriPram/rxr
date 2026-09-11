import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/db/repo";
import { USER_COOKIE_NAME, verifyUserSession } from "@/lib/user-auth";

export async function GET(req: NextRequest) {
  const session = await verifyUserSession(req.cookies.get(USER_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ success: true, data: null });
  }
  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ success: true, data: null });
  }
  return NextResponse.json({
    success: true,
    data: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
}
