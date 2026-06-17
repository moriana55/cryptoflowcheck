"use client";

import { useEffect, useState, useCallback } from "react";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ArrowLeft, RefreshCw, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { fetchBinanceCoins } from "@/lib/binance";
import { getCoinList } from "@/lib/coins";

interface HeatmapCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  price_change_percentage_24h: number | null;
}

export default function HeatmapPage() {
  const [coins, setCoins] = useState<HeatmapCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    const list = getCoinList();
    fetchBinanceCoins(list)
      .then((data) => {
        const mapped: HeatmapCoin[] = data.map((c) => ({
          id: c.id,
          symbol: c.symbol,
          name: c.name,
          current_price: c.current_price,
          market_cap: c.market_cap,
          price_change_percentage_24h: c.price_change_percentage_24h,
        }));
        const sorted = [...mapped].sort(
          (a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0)
        );
        setCoins(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Heatmap fetch error:", err);
        setError("Binance API unreachable. Rate limit or network issue.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getOpacity(change: number | null) {
    if (change == null) return 0.05;
    return Math.min(Math.abs(change) / 10, 1);
  }

  function getBg(change: number | null) {
    const op = getOpacity(change);
    if (change == null) return `rgba(255,255,255,0.03)`;
    if (change >= 0) return `rgba(16,185,129,${Math.max(op, 0.15)})`;
    return `rgba(239,68,68,${Math.max(op, 0.15)})`;
  }

  function getBorder(change: number | null) {
    if (change == null) return "rgba(255,255,255,0.08)";
    if (change >= 0)
      return `rgba(16,185,129,${Math.min(getOpacity(change) + 0.2, 1)})`;
    return `rgba(239,68,68,${Math.min(getOpacity(change) + 0.2, 1)})`;
  }

  function getTextColor(change: number | null) {
    if (change == null) return "#8E96A4";
    if (change >= 0) return "#6ee7b7";
    return "#fca5a5";
  }

  function formatPrice(val: number | null) {
    if (val == null) return "—";
    if (val >= 1) return "$" + val.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return "$" + val.toPrecision(3);
  }

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-6 py-12">
        <Link
          href="/markets"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Markets
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Market <span className="text-gradient">Heatmap</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Visual overview of the market. Green = bullish, Red = bearish. Intensity reflects the magnitude of 24h change.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 gap-2">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="glass-card text-center py-12">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <div className="text-red-400 text-sm font-bold mb-2">{error}</div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl text-[10px] font-black text-accent-cyan uppercase tracking-widest hover:bg-accent-cyan/20 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : coins.length === 0 ? (
          <div className="glass-card text-center py-12">
            <div className="text-text-secondary text-sm font-bold mb-2">No market data available.</div>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl text-[10px] font-black text-accent-cyan uppercase tracking-widest hover:bg-accent-cyan/20 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        ) : (
          /* Market-cap weighted treemap: each tile's flex-basis is proportional
             to its share of total tracked market cap, so larger coins occupy
             larger area — the classic heatmap/treemap layout. */
          (() => {
            const totalMcap = coins.reduce(
              (s, c) => s + (c.market_cap ?? 0),
              0
            );
            return (
              <div className="flex flex-wrap gap-2">
                {coins.map((coin) => {
                  const change = coin.price_change_percentage_24h;
                  const share =
                    totalMcap > 0 ? (coin.market_cap ?? 0) / totalMcap : 0;
                  // Clamp tile width between ~90px and ~340px equivalents.
                  const basisPct = Math.min(
                    Math.max(share * 100 * 3.5, 7),
                    32
                  );
                  return (
                    <Link
                      key={coin.id}
                      href={`/coin/${coin.id}`}
                      className="rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-all hover:scale-[1.03] hover:z-10 border min-h-[88px]"
                      style={{
                        backgroundColor: getBg(change),
                        borderColor: getBorder(change),
                        flexGrow: 1,
                        flexBasis: `${basisPct}%`,
                      }}
                    >
                      <span
                        className="text-xs font-black uppercase"
                        style={{ color: getTextColor(change) }}
                      >
                        {coin.symbol}
                      </span>
                      <span
                        className="text-[10px] font-bold mt-0.5"
                        style={{ color: getTextColor(change), opacity: 0.8 }}
                      >
                        {formatPrice(coin.current_price)}
                      </span>
                      <span
                        className="text-[9px] font-black mt-0.5"
                        style={{ color: getTextColor(change), opacity: 0.9 }}
                      >
                        {change != null
                          ? (change >= 0 ? "+" : "") + change.toFixed(1) + "%"
                          : "—"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            );
          })()
        )}

        {/* Legend */}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
            Legend:
          </span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-400/30 border border-emerald-400/50" />
            <span className="text-[10px] font-bold text-emerald-400">Bullish</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400/30 border border-red-400/50" />
            <span className="text-[10px] font-bold text-red-400">Bearish</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
            <span className="text-[10px] font-bold text-text-secondary">Neutral</span>
          </div>
        </div>
      </main>
    </div>
  );
}
