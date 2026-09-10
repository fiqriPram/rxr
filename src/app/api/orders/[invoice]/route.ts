import { NextRequest, NextResponse } from "next/server";
import { getTransactionByInvoice, getPaymentMethods } from "@/db/repo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoice: string }> }
) {
  try {
    const { invoice } = await params;
    const transaction = await getTransactionByInvoice(invoice);

    if (!transaction) {
      return NextResponse.json({ success: false, error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const paymentMethods = await getPaymentMethods();
    const paymentMethod = paymentMethods.find((p) => p.id === transaction.paymentMethodId);

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        instructions: paymentMethod?.instructions || [],
        paymentMethodType: paymentMethod?.type || "QRIS",
      },
    });
  } catch (error) {
    console.error("Error fetching order by invoice:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
