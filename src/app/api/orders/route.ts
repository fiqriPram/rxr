import { NextRequest, NextResponse } from "next/server";
import {
  createTransaction,
  getGameBySlug,
  getItemsByGameId,
  getPaymentMethods,
  validatePromoCode,
  getTransactionsByPhone,
} from "@/db/repo";
import { generateInvoiceNumber, calculateFee } from "@/lib/utils";
import { USER_COOKIE_NAME, verifyUserSession } from "@/lib/user-auth";
import {
  MIDTRANS_PAYMENT_MAP,
  createMidtransCharge,
  isMidtransConfigured,
} from "@/lib/midtrans";
import { packVipaymentNotes } from "@/lib/vipayment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gameSlug,
      itemId,
      paymentMethodId,
      accountData,
      customerPhone,
      customerEmail,
      promoCode,
    } = body;

    if (!gameSlug || !itemId || !paymentMethodId || !accountData?.userId || !customerPhone) {
      return NextResponse.json(
        { success: false, error: "Data pesanan tidak lengkap." },
        { status: 400 }
      );
    }

    const game = await getGameBySlug(gameSlug);
    if (!game) {
      return NextResponse.json({ success: false, error: "Game tidak ditemukan." }, { status: 404 });
    }

    const items = await getItemsByGameId(game.id);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      return NextResponse.json({ success: false, error: "Item denominasi tidak ditemukan." }, { status: 404 });
    }

    const paymentMethods = await getPaymentMethods();
    const paymentMethod = paymentMethods.find((p) => p.id === paymentMethodId);
    if (!paymentMethod) {
      return NextResponse.json({ success: false, error: "Metode pembayaran tidak valid." }, { status: 404 });
    }

    const subtotal = item.price;
    const fee = calculateFee(subtotal, paymentMethod.feeFlat, paymentMethod.feePercentage);

    let discount = 0;
    if (promoCode) {
      const promoResult = await validatePromoCode(promoCode, subtotal);
      if (promoResult.valid) {
        discount = promoResult.discount;
      }
    }

    const totalAmount = Math.max(0, subtotal + fee - discount);
    const invoiceNumber = generateInvoiceNumber();
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Payment details generation — Midtrans real, fallback demo bila belum dikonfigurasi
    let qrString: string | undefined;
    let qrImageUrl: string | undefined;
    let vaNumber: string | undefined;
    let vaExtra: string | undefined;
    let providerNotes: Record<string, unknown> = {};

    if (isMidtransConfigured()) {
      const midMethod = MIDTRANS_PAYMENT_MAP[paymentMethod.code];
      if (!midMethod) {
        return NextResponse.json(
          { success: false, error: `Metode ${paymentMethod.name} belum didukung Midtrans.` },
          { status: 400 }
        );
      }
      const charge = await createMidtransCharge({
        orderId: invoiceNumber,
        amount: totalAmount,
        method: midMethod,
        customerName: accountData.nickname || `RXR ${accountData.userId}`.slice(0, 50),
        email: customerEmail?.trim() || undefined,
        phone: customerPhone.trim(),
      });

      if (!charge.ok) {
        return NextResponse.json(
          { success: false, error: charge.statusMessage || "Gagal membuat tagihan Midtrans." },
          { status: 502 }
        );
      }

      vaNumber = charge.vaNumber;
      vaExtra = charge.vaExtra;
      qrImageUrl = charge.qrImageUrl;
      providerNotes = {
        midtransPayment: paymentMethod.code,
        midtransTransactionId: charge.transactionId,
      };
    } else if (paymentMethod.type === "QRIS") {
      qrString = `00020101021226580014ID.LINKAJA.WWW01189360091100000000005204581253033605802ID5910RXR_STORE6007JAKARTA61051234062070703A01${invoiceNumber}`;
    } else if (paymentMethod.type === "VA") {
      const prefix = paymentMethod.code.includes("BCA")
        ? "80777"
        : paymentMethod.code.includes("BRI")
        ? "12800"
        : paymentMethod.code.includes("MANDIRI")
        ? "88908"
        : "98800";
      const cleanPhone = customerPhone.replace(/[^0-9]/g, "").slice(-8);
      vaNumber = `${prefix}${cleanPhone}`;
    } else {
      vaNumber = paymentMethod.accountNumber || `RXR-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }

    const session = await verifyUserSession(req.cookies.get(USER_COOKIE_NAME)?.value);

    const tx = await createTransaction({
      userId: session?.userId,
      invoiceNumber,
      gameId: game.id,
      gameName: game.name,
      itemId: item.id,
      itemName: item.name,
      paymentMethodId: paymentMethod.id,
      paymentMethodName: paymentMethod.name,
      accountData: {
        userId: accountData.userId,
        zoneId: accountData.zoneId,
        server: accountData.server,
        nickname: accountData.nickname || "Gamer_" + accountData.userId,
      },
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail?.trim() || undefined,
      subtotal,
      fee,
      discount,
      totalAmount,
      paymentDetails: {
        qrString,
        qrImageUrl,
        vaNumber,
        vaExtra,
        expiredAt,
      },
      notes:
        Object.keys(providerNotes).length > 0
          ? packVipaymentNotes(undefined, providerNotes)
          : undefined,
    });

    return NextResponse.json({
      success: true,
      data: tx,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat pesanan" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ success: false, error: "Nomor WhatsApp wajib diisi" }, { status: 400 });
    }

    const orders = await getTransactionsByPhone(phone);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}
