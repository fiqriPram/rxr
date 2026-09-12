import { NextRequest, NextResponse } from "next/server";
import {
  createTransaction,
  getGameBySlug,
  getItemsByGameId,
  getPaymentMethods,
  getUserById,
  validatePromoCode,
  getTransactionsByPhone,
} from "@/db/repo";
import { generateInvoiceNumber, calculateFee } from "@/lib/utils";
import { auth } from "@/lib/auth";
import {
  IPAYMU_PAYMENT_MAP,
  createIpaymuPayment,
  getAppUrl,
  isIpaymuConfigured,
} from "@/lib/ipaymu";
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

    // Payment details generation — iPaymu real, fallback demo bila belum dikonfigurasi
    let qrString: string | undefined;
    let qrImageUrl: string | undefined;
    let vaNumber: string | undefined;
    let vaExtra: string | undefined;
    let providerNotes: Record<string, unknown> = {};

    if (isIpaymuConfigured()) {
      const channel = IPAYMU_PAYMENT_MAP[paymentMethod.code];
      if (!channel) {
        return NextResponse.json(
          { success: false, error: `Metode ${paymentMethod.name} belum didukung iPaymu.` },
          { status: 400 }
        );
      }
      const payment = await createIpaymuPayment({
        orderId: invoiceNumber,
        amount: totalAmount,
        channel,
        customerName: accountData.nickname || `RXR ${accountData.userId}`.slice(0, 50),
        email: customerEmail?.trim() || undefined,
        phone: customerPhone.trim(),
        productName: `${game.name} - ${item.name}`,
        notifyUrl: `${getAppUrl()}/api/payments/ipaymu/notification`,
        expiryHours: 24,
      });

      if (!payment.ok) {
        return NextResponse.json(
          { success: false, error: payment.message || "Gagal membuat tagihan iPaymu." },
          { status: 502 }
        );
      }

      // VA/cstore -> nomor bayar; QRIS/ewallet -> halaman pembayaran iPaymu.
      // (PaymentNo QRIS sandbox berisi teks demo, jangan ditampilkan sebagai nomor.)
      if (payment.paymentNo && (channel.paymentMethod === "va" || channel.paymentMethod === "cstore")) {
        vaNumber = payment.paymentNo;
      }
      providerNotes = {
        ipaymuPayment: paymentMethod.code,
        ipaymuChannel: channel.paymentChannel,
        ipaymuTransactionId: payment.transactionId,
        ipaymuUrl: payment.url,
      };
    } else if (process.env.NODE_ENV === "production") {
      // JANGAN PERNAH buat VA/QR palsu di production — tolak dengan jelas.
      return NextResponse.json(
        { success: false, error: "Payment gateway belum dikonfigurasi di server production." },
        { status: 503 }
      );
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

    const session = await auth.api.getSession({ headers: req.headers });

    const tx = await createTransaction({
      userId: session?.user.id,
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
      customerPhone: customerPhone.replace(/[^0-9]/g, ""),
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

    // Anti-intip: riwayat per nomor HP hanya untuk pemiliknya yang login.
    // Tamu tetap bisa lacak via nomor invoice di /order/[invoice].
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Silakan masuk untuk melihat riwayat pesanan." },
        { status: 401 }
      );
    }
    const user = await getUserById(session.user.id);
    const ownerPhone = (user?.phone || "").replace(/[^0-9]/g, "");
    const queryPhone = phone.replace(/[^0-9]/g, "");
    if (!ownerPhone || ownerPhone !== queryPhone) {
      return NextResponse.json(
        { success: false, error: "Nomor tidak cocok dengan akun Anda." },
        { status: 403 }
      );
    }

    const orders = await getTransactionsByPhone(phone);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}
