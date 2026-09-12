import { NextRequest, NextResponse } from "next/server";
import { updateTransactionStatus, getTransactionByInvoice } from "@/db/repo";
import { adminOrderStatusSchema } from "@/lib/validators";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ invoice: string }> }
) {
  try {
    const { invoice } = await params;
    const parsed = adminOrderStatusSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Status tidak valid" }, { status: 400 });
    }
    const { status } = parsed.data;

    const updated = await updateTransactionStatus(invoice, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
