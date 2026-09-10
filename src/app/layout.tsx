import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { plusJakartaSans } from "./fonts";

export const metadata: Metadata = {
  title: "RXR - Website Top-Up Game & Voucher Digital Instan 24 Jam",
  description:
    "Top up diamond Mobile Legends, Free Fire, Genshin Impact, Valorant Points, dan voucher digital termurah, aman, dan instan 1 detik 24 jam nonstop.",
  keywords: [
    "top up game",
    "top up ml murah",
    "diamond mlbb",
    "diamond free fire",
    "welkin genshin",
    "valorant points",
    "voucher game",
    "rxr",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`dark ${plusJakartaSans.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col bg-canvas text-slate-100 antialiased selection:bg-cyan-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
