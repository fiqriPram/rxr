"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Game, Category } from "@/db/schema";
import GameCard from "./GameCard";
import { Search, Gamepad2, X } from "lucide-react";

interface GameGridProps {
  games: Game[];
  categories: Category[];
}

export default function GameGrid({ games, categories }: GameGridProps) {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const urlSearch = searchParams.get("search") || "";
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  if (urlSearch !== prevUrlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearchQuery(urlSearch);
    setSelectedCategory("all");
  }

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchCategory =
        selectedCategory === "all" || g.categoryId === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.developer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  return (
    <section className="space-y-4" id="katalog-game">
      <div className="flex items-baseline justify-between">
        <h2 className="text-base sm:text-lg font-bold text-white">
          Katalog Game
        </h2>
        <p className="text-xs text-slate-400">
          {filteredGames.length} game tersedia
        </p>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-line-soft pb-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-panel-2 text-slate-300 hover:text-white border border-line"
            }`}
          >
            Semua ({games.length})
          </button>

          {categories.map((cat) => {
            const count = games.filter((g) => g.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3 py-1.5 font-semibold transition whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-panel-2 text-slate-400 hover:text-white border-line"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari game..."
            className="w-full rounded-lg border border-line-2 bg-field py-1.5 pl-8 pr-7 text-xs text-white placeholder-slate-400 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-panel p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-3 text-slate-300">
            <Gamepad2 className="h-5 w-5" />
          </div>
          <h4 className="mt-3 text-sm font-bold text-white">Tidak ada game yang cocok</h4>
          <p className="mt-1 text-xs text-slate-400">
            Coba gunakan kata kunci pencarian yang lain.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="btn-primary mt-3 px-3 py-1.5 text-xs"
          >
            Tampilkan Semua Game
          </button>
        </div>
      )}
    </section>
  );
}