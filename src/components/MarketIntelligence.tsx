"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CoinLogo } from "@/components/CoinLogo";
import { fetchBinanceCoins, fetchFearGreed } from "@/lib/binance";
import { getCoinList } from "@/lib/coins";

interface HeatmapCoin {
  id: string;
  symbol: string;
  price_change_percentage_24h: number | null;
}

export function MarketHeatmap() {
  const [coins, setCoins] = useState<HeatmapCoin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const list = getCoinList();
    fetchBinanceCoins(list)
      .then((data) => {
        setCoins(
          data.map((c) => ({
            id: c.id,
            symbol: c.symbol,
            price_change_percentage_24h: c.price_change_percentage_24h,
          }))
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function getOpacity(change: number | null) {
    if (change == null) return 0.05;
    return Math.min(Math.abs(change) / 15, 1);
  }

  function getBg(change: number | null) {
    const op = getOpacity(change);
    if (change == null) return `rgba(31,42,66,0.5)`;
    if (change >= 0) return `rgba(52,211,153,${Math.max(op, 0.1)})`;
    return `rgba(248,113,113,${Math.max(op, 0.1)})`;
  }

  function getBorder(change: number | null) {
    if (change == null) return "rgba(40,50,72,0.6)";
    if (change >= 0) return `rgba(52,211,153,${Math.min(getOpacity(change) + 0.2, 1)})`;
    return `rgba(248,113,113,${Math.min(getOpacity(change) + 0.2, 1)})`;
  }

  function getText(change: number | null) {
    if (change == null) return "#8a98b5";
    if (change >= 0) return "#6ee7b7";
    return "#fca5a5";
  }

  if (loading) {
    return (
      <div className="glass-panel rounded-xl">
        <div className="font-geist text-label-md text-on-surface-variant uppercase mb-6 pl-3 border-l-2 border-primary-container">
          Flow Heatmap
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-container-high animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl">
      <div className="font-geist text-label-md text-on-surface-variant uppercase mb-6 pl-3 border-l-2 border-primary-container">
        Flow Heatmap
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {coins.slice(0, 20).map((coin) => (
          <Link
            key={coin.id}
            href={`/coin/${coin.id}`}
            className="aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-bold cursor-pointer transition-transform hover:scale-105 border"
            style={{
              backgroundColor: getBg(coin.price_change_percentage_24h),
              borderColor: getBorder(coin.price_change_percentage_24h),
              color: getText(coin.price_change_percentage_24h),
            }}
          >
            <CoinLogo symbol={coin.symbol} size={20} className="mb-1" />
            <span className="uppercase text-[9px]">{coin.symbol}</span>
            <span className="text-[9px] opacity-80 mt-0.5">
              {coin.price_change_percentage_24h != null
                ? (coin.price_change_percentage_24h >= 0 ? "+" : "") +
                  coin.price_change_percentage_24h.toFixed(1) +
                  "%"
                : "—"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SentimentGauge() {
  const [value, setValue] = useState<number | null>(null);
  const [label, setLabel] = useState<string>("Loading...");

  useEffect(() => {
    fetchFearGreed()
      .then((data) => {
        if ("value" in data) {
          setValue(data.value);
          setLabel(data.classification || "Unknown");
        }
      })
      .catch(() => setLabel("Unavailable"));
  }, []);

  const displayValue = value ?? 0;

  // Fear & Greed semantics: extreme greed → green, neutral → amber,
  // extreme fear → red. (Greed isn't inherently "good", but green/red here
  // tracks the conventional crypto sentiment-gauge convention.)
  const gaugeColor =
    displayValue >= 75 ? "#34d399"
    : displayValue >= 55 ? "#6ee7b7"
    : displayValue >= 45 ? "#fbbf24"
    : displayValue >= 25 ? "#fb923c"
    : "#f87171";

  const labelColor =
    displayValue >= 75 ? "text-bullish-green"
    : displayValue >= 55 ? "text-bullish-green"
    : displayValue >= 45 ? "text-tertiary"
    : displayValue >= 25 ? "text-tertiary"
    : "text-bearish-red";

  return (
    <div className="glass-panel p-stack-md rounded-xl text-center border-outline-variant/30">
      <p className="font-geist text-label-md text-on-surface-variant mb-6 text-left">FEAR & GREED INDEX</p>

      <div className="relative w-48 h-24 mx-auto overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 100 50">
          <path
            d="M 10 45 A 40 40 0 0 1 90 45"
            fill="none"
            stroke="#1f2a42"
            strokeLinecap="round"
            strokeWidth="12"
          />
          {value != null && (
            <>
              <defs>
                <linearGradient id="fearGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" style={{ stopColor: "#ff5e00", stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: "#ffdcc3", stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <path
                className="gauge-glow"
                d={`M 10 45 A 40 40 0 ${displayValue > 50 ? 1 : 0} 1 ${
                  50 - 40 * Math.cos((displayValue / 100) * Math.PI)
                } ${45 - 40 * Math.sin((displayValue / 100) * Math.PI)}`}
                fill="none"
                stroke={gaugeColor}
                strokeLinecap="round"
                strokeWidth="14"
              />
            </>
          )}
        </svg>
      </div>

      <div className="mt-4">
        <h4 className="font-mono text-4xl font-bold tabular-nums" style={{ color: gaugeColor }}>
          {value != null ? value : "—"}
        </h4>
        <p className={`font-mono text-lg font-bold mt-1 tracking-widest ${labelColor}`}>
          {label.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
