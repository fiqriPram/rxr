"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Zap, Volume2 } from "lucide-react";

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  tag: string;
  linkText: string;
  href: string;
  image?: string | null;
  tint: "blue" | "indigo" | "emerald" | "rose" | "amber";
}

interface HeroBannerProps {
  slides: HeroSlide[];
}

const tintOverlay: Record<HeroSlide["tint"], string> = {
  blue: "from-blue-600/55 via-blue-950/35 to-canvas",
  indigo: "from-indigo-500/55 via-indigo-950/35 to-canvas",
  emerald: "from-emerald-500/50 via-emerald-950/35 to-canvas",
  rose: "from-rose-500/50 via-rose-950/30 to-canvas",
  amber: "from-amber-500/45 via-amber-950/30 to-canvas",
};

const tintBadge: Record<HeroSlide["tint"], string> = {
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  amber: "bg-amber-500",
};

export default function HeroBanner({ slides }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [paused, slides.length]);

  const go = (idx: number) => setCurrent((idx + slides.length) % slides.length);

  return (
    <div className="space-y-3">
      {/* Main Banner Slider */}
      <div
        className="relative h-[240px] sm:h-[300px] lg:h-[340px] overflow-hidden rounded-xl border border-line bg-panel shadow-lg"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {slides.map((slide, idx) => {
          const active = idx === current;
          const overlay = tintOverlay[slide.tint];
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-all duration-700 ${
                active ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={!active}
            >
              {/* Artwork */}
              <div className="absolute inset-0">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={`h-full w-full object-cover transition-transform duration-[2000ms] ${
                      active ? "scale-100" : "scale-110"
                    }`}
                  />
                ) : (
                  <div className="h-full w-full bg-[radial-gradient(45rem_30rem_at_85%_-5%,rgba(34,211,238,0.22),transparent_55%),radial-gradient(32rem_26rem_at_5%_125%,rgba(245,158,11,0.14),transparent_55%),linear-gradient(135deg,#0b1121,#070b16)]">
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 select-none">
                      <img src="/images/rxr.webp" alt="RXR" className="h-20 w-20 select-none rounded-2xl shadow-[0_8px_30px_-8px_rgba(59,130,246,0.6)]" />
                    </div>
                  </div>
                )}
                {/* Readability overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${overlay}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-black/30" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-8">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow ${tintBadge[slide.tint]}`}
                  >
                    {slide.badge}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-black/45 px-2 py-0.5 text-[11px] font-medium text-slate-100 backdrop-blur-sm border border-white/10">
                    <Zap className="h-3 w-3 text-amber-300" />
                    Proses Instan
                  </span>
                </div>

                <div className="my-3 max-w-xl">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    {slide.title}
                  </h2>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-200/95 line-clamp-2 leading-relaxed">
                    {slide.subtitle}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={slide.href}
                      className="btn-primary px-4 py-2 text-xs sm:text-sm"
                    >
                      {slide.linkText} →
                    </Link>
                    <span className="rounded-lg bg-black/45 px-2.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm border border-white/10">
                      {slide.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {slides.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => go(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === current
                            ? "w-5 bg-blue-400"
                            : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Arrow Navigation */}
        <button
          onClick={() => go(current - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-slate-200 hover:bg-black/70 hover:text-white transition"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(current + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1.5 text-slate-200 hover:bg-black/70 hover:text-white transition"
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Ticker / Running Announcement */}
      <div className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-canvas-soft px-3.5 py-2 text-xs text-slate-300">
        <Volume2 className="h-4 w-4 text-amber-400 shrink-0" />
        <div className="flex-1 overflow-hidden whitespace-nowrap">
          <span className="font-semibold text-amber-400 mr-2">[INFO RESMI]:</span>
          <span>Semua transaksi berjalan normal 24 jam nonstop • Garansi diamond masuk 1-3 detik via server distributor resmi.</span>
        </div>
      </div>
    </div>
  );
}