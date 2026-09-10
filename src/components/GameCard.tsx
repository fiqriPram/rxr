"use client";

import Link from "next/link";
import { Game } from "@/db/schema";
import { Zap, Gamepad2 } from "lucide-react";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/topup/${game.slug}`}
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-line bg-panel hover:border-line-strong hover:bg-panel-3 hover:shadow-[0_14px_36px_-18px_rgba(59,130,246,0.5)] hover:-translate-y-0.5"
    >
      {/* Game Thumbnail */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-canvas-soft">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-panel-3 to-canvas-soft">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/70 to-indigo-600/70 text-2xl font-black text-white">
            {game.name.charAt(0)}
          </div>
        </div>
        <img
          src={game.thumbnailUrl}
          alt={game.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent opacity-90" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.isPopular && (
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
              Populer
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2">
          <span className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-amber-300 backdrop-blur-sm border border-white/10">
            <Zap className="h-2.5 w-2.5 text-amber-400" />
            Instan
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 line-clamp-1">
            {game.developer}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 transition-colors group-hover:text-blue-400">
            {game.name}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-line-soft pt-2 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Gamepad2 className="h-3 w-3" />
            Top Up
          </span>
          <span className="font-semibold text-blue-400 transition-transform group-hover:translate-x-0.5">
            Beli →
          </span>
        </div>
      </div>
    </Link>
  );
}