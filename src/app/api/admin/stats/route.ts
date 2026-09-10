import { NextResponse } from "next/server";
import { getAllTransactions, getAllGamesAdmin, getAllPaymentMethodsAdmin } from "@/db/repo";

export async function GET() {
  try {
    const [transactions, games, paymentMethods] = await Promise.all([
      getAllTransactions(),
      getAllGamesAdmin(),
      getAllPaymentMethodsAdmin(),
    ]);

    const totalOrders = transactions.length;
    const successOrders = transactions.filter((t) => t.status === "SUCCESS");
    const pendingOrders = transactions.filter((t) => t.status === "PENDING" || t.status === "PAID");
    const failedOrders = transactions.filter((t) => t.status === "FAILED");

    const totalRevenue = successOrders.reduce((sum, t) => sum + t.totalAmount, 0);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          successCount: successOrders.length,
          pendingCount: pendingOrders.length,
          failedCount: failedOrders.length,
          activeGamesCount: games.filter((g) => g.isActive).length,
          activePaymentCount: paymentMethods.filter((p) => p.isActive).length,
        },
        recentTransactions: transactions.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Failed to load admin stats:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
