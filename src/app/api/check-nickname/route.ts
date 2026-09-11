import { NextRequest, NextResponse } from "next/server";
import { mockGameNickname } from "@/lib/utils";
import {
  getVipaymentNickname,
  isVipaymentConfigured,
  VIPAYMENT_NICKNAME_CODE,
} from "@/lib/vipayment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameSlug, userId, zoneId, server } = body;

    if (!userId || typeof userId !== "string" || userId.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "User ID tidak valid atau terlalu pendek (min. 3 karakter)" },
        { status: 400 }
      );
    }

    const cleanUserId = userId.trim();
    const zone = (zoneId || server || "").trim();
    const nicknameCode = VIPAYMENT_NICKNAME_CODE[gameSlug || ""];

    // Real API check via VIPayment
    if (isVipaymentConfigured() && nicknameCode) {
      try {
        const result = await getVipaymentNickname({
          code: nicknameCode,
          userId: cleanUserId,
          zoneId: zone,
        });

        if (result.ok && result.nickname) {
          return NextResponse.json({
            success: true,
            data: {
              userId: cleanUserId,
              zoneId: zoneId ? zoneId.trim() : undefined,
              server: server ? server.trim() : undefined,
              nickname: result.nickname,
              verified: true,
            },
          });
        }

        // Error koneksi/IP/blokir provider -> fallback demo agar user tetap bisa lanjut.
        // Error ID tidak valid -> tetap 400.
        const providerMsg = result.message || "";
        const isProviderIssue =
          /tidak diizinkan|not allowed|ip[^a-z]*blokir|blokir|invalid.*(key|sign)|unauthor|maintenance|timeout|network|fetch failed|econn|socket hang up|50[023]/i.test(
            providerMsg
          );
        if (!isProviderIssue) {
          return NextResponse.json(
            { success: false, error: providerMsg || "User ID tidak valid." },
            { status: 400 }
          );
        }
        console.warn("VIPayment nickname provider issue, falling back to mock:", providerMsg);
      } catch (e) {
        console.warn("VIPayment nickname check failed, falling back to mock:", e);
      }
    }

    // Fallback: mock nickname generator (JELAS bertanda demo, bukan nickname asli)
    const nickname = mockGameNickname(gameSlug || "game", cleanUserId, zone);

    return NextResponse.json({
      success: true,
      data: {
        userId: cleanUserId,
        zoneId: zoneId ? zoneId.trim() : undefined,
        server: server ? server.trim() : undefined,
        nickname,
        verified: false,
        demo: true,
      },
    });
  } catch (error) {
    console.error("Error checking nickname:", error);
    return NextResponse.json({ success: false, error: "Gagal memverifikasi User ID" }, { status: 500 });
  }
}