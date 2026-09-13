"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Game, Category } from "@/db/schema";
import SafeImage from "./SafeImage";
import { Flame, X } from "lucide-react";

interface GameGridProps {
  games: Game[];
  categories: Category[];
}

// Tab ala foto: Top Up (mobile+pc), Voucher, Apps
function tabOf(game: Game, categories: Category[]): string {
  const cat = categories.find((c) => c.id === game.categoryId);
  if (!cat) return "topup";
  if (cat.slug === "voucher") return "voucher";
  if (cat.slug === "apps") return "apps";
  return "topup";
}

const TABS = [
  { id: "topup", label: "Top Up" },
  { id: "voucher", label: "Voucher" },
  { id: "apps", label: "Apps" },
];

export default function GameGrid({ games, categories }: GameGridProps) {
  const searchParams = useSearchParams();
  const [selectedTab, setSelectedTab] = useState<string>("topup");
  const urlSearch = searchParams.get("search") || "";
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
  }

  const popularGames = useMemo(() => games.filter((g) => g.isPopular), [games]);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchTab = tabOf(g, categories) === selectedTab;
      const matchSearch =
        searchQuery === "" ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.developer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [games, categories, selectedTab, searchQuery]);

  return (
    <section id="katalog-game" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6">
      {/* Populer Sekarang */}
      <div>
        <h2 className="flex items-center gap-1.5 text-lg sm:text-xl font-black tracking-wide text-white">
          <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
          POPULER SEKARANG!
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
          Berikut adalah beberapa produk yang paling populer saat ini.
        </p>

        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {popularGames.map((game) => (
            <Link
              key={game.id}
              href={`/topup/${game.slug}`}
              title={game.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-blue-500"
            >
              <span className="block aspect-[4/3] w-full overflow-hidden bg-panel-2 p-2">
                <SafeImage
                  src={game.thumbnailUrl}
                  alt={game.name}
                  className="h-full w-full object-contain"
                />
              </span>
              <span className="block truncate px-2.5 py-2 text-center text-[11px] sm:text-xs font-bold text-white">
                {game.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTab(t.id)}
            className={`rounded-lg px-5 py-2 text-sm font-bold transition border ${
              selectedTab === t.id
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-panel border-line text-slate-300 hover:text-white hover:border-line-strong"
            }`}
          >
            {t.label}
          </button>
        ))}
        {searchQuery && (
          <span className="flex items-center gap-1.5 rounded-lg bg-panel border border-line px-3 py-2 text-xs text-slate-300">
            Hasil: “{searchQuery}”
            <button
              onClick={() => setSearchQuery("")}
              className="text-slate-500 hover:text-white"
              aria-label="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        )}
      </div>

      {/* Tile grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filteredGames.map((game) => (
              <Link
                key={game.id}
                href={`/topup/${game.slug}`}
                title={game.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition hover:border-blue-500"
              >
                <span className="block aspect-[4/3] w-full overflow-hidden bg-panel-2 p-2">
                  <SafeImage
                    src={game.thumbnailUrl}
                    alt={game.name}
                    className="h-full w-full object-contain"
                  />
                </span>
                <span className="block truncate px-2.5 py-2 text-center text-[11px] sm:text-xs font-bold text-white">
                  {game.name}
                </span>
              </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-panel p-10 text-center">
          <p className="text-sm font-bold text-white">Tidak ada game yang cocok</p>
          <p className="mt-1 text-xs text-slate-400">Coba kata kunci lain.</p>
          <button
            onClick={() => {
              setSelectedTab("topup");
              setSearchQuery("");
            }}
            className="btn-primary mt-3 px-4 py-2 text-xs"
          >
            Tampilkan Semua
          </button>
        </div>
      )}
    </section>
  );
}
