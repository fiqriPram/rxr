import { getAllTransactions, getAllGamesAdmin, getAllPaymentMethodsAdmin } from "@/db/repo";
import { isDatabaseConfigured } from "@/db";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard - RXR Top-Up Store",
  description: "Manajemen pesanan, produk game, dan metode pembayaran RXR",
};

export default async function AdminPage() {
  const [transactions, games, paymentMethods] = await Promise.all([
    getAllTransactions(),
    getAllGamesAdmin(),
    getAllPaymentMethodsAdmin(),
  ]);

  return (
    <AdminDashboardClient
      initialTransactions={transactions}
      games={games}
      paymentMethods={paymentMethods}
      isDbConnected={isDatabaseConfigured}
    />
  );
}
