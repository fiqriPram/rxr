import { NextRequest, NextResponse } from "next/server";
import { validatePromoCode } from "@/db/repo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ success: false, error: "Kode promo wajib diisi" }, { status: 400 });
    }

    const result = await validatePromoCode(code, Number(subtotal) || 0);

    if (!result.valid) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        discount: result.discount,
        message: result.message,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses kode promo" }, { status: 500 });
  }
}
