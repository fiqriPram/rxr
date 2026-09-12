"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const FALLBACK_SRC = "/images/rxr.webp";

// Image dengan fallback otomatis bila file tidak ada/rusak.
export default function SafeImage({ src, alt, className, loading = "lazy" }: SafeImageProps) {
  const [current, setCurrent] = useState(src);
  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (current !== FALLBACK_SRC) setCurrent(FALLBACK_SRC);
      }}
    />
  );
}
