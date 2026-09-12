import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ success: true, data: null });
  }
  const u = session.user as typeof session.user & { phone?: string | null };
  return NextResponse.json({
    success: true,
    data: { id: u.id, name: u.name, email: u.email, phone: u.phone ?? null },
  });
}
