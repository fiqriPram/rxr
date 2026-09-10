import { NextRequest, NextResponse } from "next/server";
import { getGameBySlug, getItemsByGameId, getPaymentMethods } from "@/db/repo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const game = await getGameBySlug(slug);

    if (!game) {
      return NextResponse.json({ success: false, error: "Game not found" }, { status: 404 });
    }

    const [items, paymentMethods] = await Promise.all([
      getItemsByGameId(game.id),
      getPaymentMethods(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        game,
        items,
        paymentMethods,
      },
    });
  } catch (error) {
    console.error("Failed to fetch game details:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
