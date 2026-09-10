import { NextRequest, NextResponse } from "next/server";
import { getGames, getCategories } from "@/db/repo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search")?.toLowerCase() || "";

    const [games, categories] = await Promise.all([
      getGames(category),
      getCategories(),
    ]);

    let filtered = games;
    if (search) {
      filtered = games.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.developer.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, data: filtered, categories });
  } catch (error) {
    console.error("Failed to fetch games:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
