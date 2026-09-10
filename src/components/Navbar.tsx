"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Receipt,
  Headphones,
  Shield,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/?search=${encodeURIComponent(searchVal.trim())}#katalog-game`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line-soft bg-canvas-soft/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/images/rxr.webp" alt="RXR" className="h-9 w-9 rounded-lg transition-transform group-hover:-rotate-6 group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                RXR<span className="text-amber-400">.</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Game Top-Up
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold">
            <Link
              href="/#katalog-game"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Semua Game
            </Link>
            <Link
              href="/#promo-section"
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Promo Spesial
            </Link>
            <Link
              href="/lacak"
              className="flex items-center gap-1.5 text-slate-300 hover:text-blue-400 transition-colors"
            >
              <Receipt className="h-3.5 w-3.5 text-blue-400" />
              Lacak Pesanan
            </Link>
          </nav>
        </div>

        {/* Center: Global Quick Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Cari game favorit (MLBB, Free Fire, Genshin...)"
              className="w-full rounded-lg border border-line-2 bg-field py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:bg-panel-3 transition"
            />
          </form>
        </div>

        {/* Right: Actions */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/lacak"
            className="flex items-center gap-1.5 rounded-lg border border-line-2 bg-panel-2 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-panel-3 hover:text-white transition"
          >
            <Receipt className="h-3.5 w-3.5 text-blue-400" />
            <span>Cek Transaksi</span>
          </Link>

          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600/15 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/25 transition"
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>CS 24 Jam</span>
          </a>

          <Link
            href="/admin"
            className="rounded-lg p-2 text-slate-400 hover:bg-panel-3 hover:text-slate-200 transition"
            title="Admin Dashboard"
          >
            <Shield className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/lacak"
            className="rounded-lg bg-panel-2 border border-line-2 p-2 text-slate-300"
          >
            <Receipt className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-400 hover:bg-panel-2 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-line-soft bg-canvas-soft px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Cari game..."
              className="w-full rounded-lg border border-line-2 bg-field py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-blue-500"
            />
          </form>

          <div className="space-y-1 text-sm font-medium">
            <Link
              href="/#katalog-game"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-panel-2"
            >
              Katalog Game
            </Link>
            <Link
              href="/#promo-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-amber-300 hover:bg-panel-2"
            >
              Promo & Diskon
            </Link>
            <Link
              href="/lacak"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-panel-2"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-slate-400 hover:bg-panel-2"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
