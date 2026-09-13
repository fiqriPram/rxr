import { notFound } from "next/navigation";
import { getTransactionByInvoice, getPaymentMethods } from "@/db/repo";
import { expireStaleTransaction } from "@/lib/fulfill";
import OrderClient from "./OrderClient";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ invoice: string }>;
}

export async function generateMetadata({ params }: OrderPageProps) {
  const { invoice } = await params;
  return {
    title: `Invoice #${invoice} - RXR Top-Up`,
    description: `Detail dan instruksi pembayaran faktur ${invoice}`,
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { invoice } = await params;
  let transaction = await getTransactionByInvoice(invoice);

  if (!transaction) {
    notFound();
  }

  // Lazy expiry: order PENDING yang lewat batas waktu otomatis FAILED
  if (transaction.status === "PENDING" && (await expireStaleTransaction(invoice))) {
    transaction = (await getTransactionByInvoice(invoice)) || transaction;
  }

  const paymentMethods = await getPaymentMethods();
  const paymentMethod = paymentMethods.find((p) => p.id === transaction.paymentMethodId);

  return (
    <OrderClient
      initialTransaction={transaction}
      instructions={paymentMethod?.instructions || []}
      paymentMethodType={paymentMethod?.type || "QRIS"}
    />
  );
}
