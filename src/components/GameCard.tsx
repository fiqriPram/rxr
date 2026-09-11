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
      className="card-hover group flex flex-col overflow-hidden rounded-xl border border-line bg-panel"
    >
      {/* Game Thumbnail */}
      <div className="relative aspect-square w-full overflow-hidden bg-panel-2">
        <img
          src={game.thumbnailUrl}
          alt={game.name}
          className="absolute inset-0 h-full w-full object-contain p-3"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {game.isPopular && (
            <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              Populer
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2">
          <span className="flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
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
          <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
            {game.name}
          </h3>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-line-soft pt-2 text-[11px]">
          <span className="flex items-center gap-1 text-slate-400">
            <Gamepad2 className="h-3 w-3" />
            Top Up
          </span>
          <span className="font-semibold text-blue-400">
            Beli →
          </span>
        </div>
      </div>
    </Link>
  );
}