"use client";

import { useState, useEffect, useRef } from "react";
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

const tintCard: Record<HeroSlide["tint"], string> = {
  blue: "from-[#123a8f] via-[#1a56c4] to-[#0a1f52]",
  indigo: "from-[#3b1470] via-[#5b21b6] to-[#1c0a3d]",
  emerald: "from-[#064e3b] via-[#059669] to-[#022c22]",
  rose: "from-[#701a3a] via-[#be185d] to-[#3d0a20]",
  amber: "from-[#713f12] via-[#d97706] to-[#3a2005]",
};

export default function HeroBanner({ slides }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const n = slides.length;

  useEffect(() => {
    if (paused || n <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % n);
    }, 5500);
    return () => clearInterval(timer);
  }, [paused, n]);

  const go = (idx: number) => setCurrent(((idx % n) + n) % n);

  // Normalize offset to [-n/2, n/2] for coverflow positioning
  const offsetOf = (idx: number) => {
    let o = (idx - current) % n;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  };

  return (
    <div className="space-y-3">
      {/* Coverflow Carousel */}
      <div
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(dx) < 40) return;
          go(current + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="relative mx-auto h-[220px] sm:h-[290px] lg:h-[320px] max-w-5xl [perspective:1200px]">
          {slides.map((slide, idx) => {
            const o = offsetOf(idx);
            const abs = Math.abs(o);
            const active = o === 0;
            const visible = abs <= 2;
            return (
              <div
                key={slide.id}
                className="absolute inset-y-0 left-1/2 w-[86%] sm:w-[68%] transition-all duration-500 ease-out will-change-transform"
                style={{
                  transform: `translateX(-50%) translateX(${o * 62}%) scale(${active ? 1 : 0.86 - Math.min(abs - 1, 1) * 0.06})`,
                  zIndex: 20 - abs,
                  opacity: visible ? (active ? 1 : 0.55) : 0,
                  pointerEvents: active ? "auto" : "none",
                }}
                aria-hidden={!active}
              >
                <Link
                  href={slide.href}
                  tabIndex={active ? 0 : -1}
                  className={`relative flex h-full w-full flex-col justify-center gap-2 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br p-6 text-left shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] sm:gap-3 sm:p-10 ${tintCard[slide.tint]}`}
                >
                  {/* Decorative circles */}
                  <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-black/20" />
                  {/* Icon */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="text-4xl leading-none drop-shadow sm:text-6xl">
                      ⚡
                    </span>
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/50 bg-cyan-400/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-200 sm:text-[10px]">
                        <Zap className="h-3 w-3" />
                        {slide.badge}
                      </span>
                      <h2 className="mt-1.5 truncate text-xl font-extrabold tracking-tight text-white drop-shadow sm:text-3xl">
                        {slide.title}
                      </h2>
                    </div>
                  </div>
                  <p className="max-w-md text-[11px] leading-relaxed text-white/80 sm:text-sm line-clamp-2">
                    {slide.subtitle}
                  </p>
                  {active && (
                    <span className="mt-1 hidden w-fit items-center gap-2 text-xs font-semibold text-cyan-200 sm:inline-flex">
                      {slide.linkText} →
                      <span className="rounded-md bg-black/30 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                        {slide.tag}
                      </span>
                    </span>
                  )}
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute -right-6 top-1/2 hidden h-[130%] w-auto -translate-y-1/2 select-none object-contain opacity-40 [mask-image:linear-gradient(to_left,black_55%,transparent)] md:block"
                    />
                  ) : null}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Arrow Navigation */}
        <button
          onClick={() => go(current - 1)}
          className="absolute left-1 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/80 sm:left-3"
          aria-label="Slide sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => go(current + 1)}
          className="absolute right-1 top-1/2 z-30 -translate-y-1/2 rounded-full border border-white/20 bg-black/50 p-2 text-white backdrop-blur transition hover:bg-black/80 sm:right-3"
          aria-label="Slide berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots */}
        <div className="mt-3 flex items-center justify-center gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => go(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === current
                  ? "w-8 bg-violet-400"
                  : "w-4 bg-white/25 hover:bg-white/50"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Ticker / Running Announcement */}
      <div className="flex items-center gap-2.5 overflow-hidden rounded-lg border border-amber-500/25 bg-amber-500/5 px-3.5 py-2.5 text-xs">
        <Volume2 className="h-4 w-4 text-amber-300 shrink-0" />
        <div className="flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_1.5rem,black_calc(100%-1.5rem),transparent)]">
          <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
            {[0, 1].map((n) => (
              <span key={n} aria-hidden={n === 1}>
                <span className="font-bold text-amber-200 mr-2 tracking-wide">[INFO RESMI]:</span>
                <span className="font-medium text-slate-100">Semua transaksi berjalan normal 24 jam nonstop • Garansi diamond masuk 1-3 detik.</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
