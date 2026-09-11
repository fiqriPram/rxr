import { notFound } from "next/navigation";
import { getTransactionByInvoice, getPaymentMethods } from "@/db/repo";
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
  const transaction = await getTransactionByInvoice(invoice);

  if (!transaction) {
    notFound();
  }

  const paymentMethods = await getPaymentMethods();
  const paymentMethod = paymentMethods.find((p) => p.id === transaction.paymentMethodId);

  return (
    <OrderClient
      initialTransaction={transaction}
      instructions={paymentMethod?.instructions || []}
      paymentMethodType={paymentMethod?.type || "QRIS"}
      allowSandbox={process.env.NODE_ENV !== "production"}
    />
  );
}
