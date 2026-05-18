"use client";

import { useState } from "react";

interface CoinLogoProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function CoinLogo({ symbol, size = 36, className = "" }: CoinLogoProps) {
  const [error, setError] = useState(false);
  const s = symbol.toLowerCase();

  if (error) {
    return (
      <div
        className={`rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase text-white shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${s}.png`}
      alt={symbol}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
