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
    if (change == null) return `rgba(255,255,255,0.05)`;
    if (change >= 0) return `rgba(16,185,129,${Math.max(op, 0.1)})`; // emerald
    return `rgba(239,68,68,${Math.max(op, 0.1)})`; // red
  }

  function getBorder(change: number | null) {
    if (change == null) return "rgba(255,255,255,0.1)";
    if (change >= 0) return `rgba(16,185,129,${Math.min(getOpacity(change) + 0.2, 1)})`;
    return `rgba(239,68,68,${Math.min(getOpacity(change) + 0.2, 1)})`;
  }

  function getText(change: number | null) {
    if (change == null) return "#8E96A4";
    if (change >= 0) return "#34d399";
    return "#f87171";
  }

  if (loading) {
    return (
      <div className="glass-card">
        <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan">
          Flow Heatmap
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan">
        Flow Heatmap
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {coins.slice(0, 20).map((coin) => (
          <Link
            key={coin.id}
            href={`/coin/${coin.id}`}
            className="aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] font-black cursor-pointer transition-transform hover:scale-105 border"
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
  const angle = (displayValue / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const r = 50;
  const cx = 60;
  const cy = 55;
  const x = cx - r * Math.cos(rad);
  const y = cy - r * Math.sin(rad);
  const largeArc = angle > 90 ? 1 : 0;

  const gaugeColor =
    displayValue >= 75 ? "#34d399"
    : displayValue >= 55 ? "#00F2FF"
    : displayValue >= 45 ? "#fbbf24"
    : displayValue >= 25 ? "#fb923c"
    : "#f87171";

  const labelColor =
    displayValue >= 75 ? "text-emerald-400"
    : displayValue >= 55 ? "text-accent-cyan"
    : displayValue >= 45 ? "text-amber-400"
    : displayValue >= 25 ? "text-orange-400"
    : "text-red-400";

  return (
    <div className="glass-card text-center flex flex-col items-center">
      <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan self-start">
        Fear & Greed Index
      </div>

      <svg viewBox="0 0 120 70" className="w-40 h-24 mt-2">
        <path
          d={`M 10 55 A 50 50 0 0 1 110 55`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {value != null && (
          <path
            d={`M 10 55 A 50 50 0 ${largeArc} 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="10"
            strokeLinecap="round"
          />
        )}
        <circle cx={x} cy={y} r="4" fill={gaugeColor} />
      </svg>

      <div className="text-3xl font-black mt-2">
        {value != null ? value : "—"}
      </div>
      <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${labelColor}`}>
        {label}
      </div>
    </div>
  );
}
