"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image?: string | null;
  current_price?: number;
  market_cap?: number | null;
  total_volume?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number | null;
  price_change_percentage_30d?: number | null;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  atl?: number | null;
  atl_date?: string | null;
}

interface CompareTableProps {
  coinA: CoinData | null;
  coinB: CoinData | null;
  loading: boolean;
}

function formatNum(n: number | undefined | null, opts?: { style?: string; currency?: string; maximumFractionDigits?: number; minimumFractionDigits?: number }) {
  if (n == null) return "—";
  if (opts?.style === "currency") {
    if (n >= 1_000_000_000) return "$" + (n / 1_000_000_000).toFixed(2) + "B";
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return "$" + n.toPrecision(4);
  }
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  return n.toLocaleString("en-US", { maximumFractionDigits: opts?.maximumFractionDigits ?? 2 });
}

function PctCell({ value }: { value: number | undefined | null }) {
  if (value == null) return <span className="text-text-secondary">—</span>;
  const positive = value >= 0;
  return (
    <div className={`flex items-center gap-1.5 ${positive ? "text-emerald-400" : "text-red-400"}`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span className="text-xs font-black">{positive ? "+" : ""}{value.toFixed(2)}%</span>
    </div>
  );
}

function WinnerBadge({ a, b, higher = true }: { a?: number | null; b?: number | null; higher?: boolean }) {
  if (a == null || b == null) return null;
  const aWins = higher ? a > b : a < b;
  const bWins = higher ? b > a : b < a;
  if (!aWins && !bWins) return null;
  return aWins ? "A" : "B";
}

export function CompareTable({ coinA, coinB, loading }: CompareTableProps) {
  if (loading) {
    return (
      <div className="glass-card animate-pulse">
        <div className="h-6 bg-white/5 rounded w-48 mb-6" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl mb-3" />
        ))}
      </div>
    );
  }

  if (!coinA || !coinB) return null;

  const rows: { label: string; valA: string; valB: string; winner: "A" | "B" | null; rawA?: number | null; rawB?: number | null; isPct?: boolean }[] = [
    {
      label: "Price",
      valA: formatNum(coinA.current_price, { style: "currency" }),
      valB: formatNum(coinB.current_price, { style: "currency" }),
      winner: null,
    },
    {
      label: "24h Change",
      valA: "", valB: "",
      rawA: coinA.price_change_percentage_24h,
      rawB: coinB.price_change_percentage_24h,
      winner: WinnerBadge({ a: coinA.price_change_percentage_24h, b: coinB.price_change_percentage_24h }) as any,
      isPct: true,
    },
    {
      label: "7d Change",
      valA: "", valB: "",
      rawA: coinA.price_change_percentage_7d,
      rawB: coinB.price_change_percentage_7d,
      winner: WinnerBadge({ a: coinA.price_change_percentage_7d, b: coinB.price_change_percentage_7d }) as any,
      isPct: true,
    },
    {
      label: "30d Change",
      valA: "", valB: "",
      rawA: coinA.price_change_percentage_30d,
      rawB: coinB.price_change_percentage_30d,
      winner: WinnerBadge({ a: coinA.price_change_percentage_30d, b: coinB.price_change_percentage_30d }) as any,
      isPct: true,
    },
    {
      label: "Market Cap",
      valA: formatNum(coinA.market_cap, { style: "currency" }),
      valB: formatNum(coinB.market_cap, { style: "currency" }),
      winner: WinnerBadge({ a: coinA.market_cap, b: coinB.market_cap }) as any,
    },
    {
      label: "24h Volume",
      valA: formatNum(coinA.total_volume, { style: "currency" }),
      valB: formatNum(coinB.total_volume, { style: "currency" }),
      winner: WinnerBadge({ a: coinA.total_volume, b: coinB.total_volume }) as any,
    },
    {
      label: "Circulating Supply",
      valA: formatNum(coinA.circulating_supply) + " " + coinA.symbol.toUpperCase(),
      valB: formatNum(coinB.circulating_supply) + " " + coinB.symbol.toUpperCase(),
      winner: null,
    },
    {
      label: "Max Supply",
      valA: coinA.max_supply ? formatNum(coinA.max_supply) : "Unlimited",
      valB: coinB.max_supply ? formatNum(coinB.max_supply) : "Unlimited",
      winner: null,
    },
    {
      label: "All-Time High",
      valA: formatNum(coinA.ath, { style: "currency" }),
      valB: formatNum(coinB.ath, { style: "currency" }),
      winner: null,
    },
    {
      label: "ATH Change",
      valA: "", valB: "",
      rawA: coinA.ath_change_percentage,
      rawB: coinB.ath_change_percentage,
      winner: WinnerBadge({ a: coinA.ath_change_percentage, b: coinB.ath_change_percentage }) as any,
      isPct: true,
    },
    {
      label: "All-Time Low",
      valA: formatNum(coinA.atl, { style: "currency" }),
      valB: formatNum(coinB.atl, { style: "currency" }),
      winner: null,
    },
  ];

  return (
    <div className="glass-card">
      <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan">
        Detailed Comparison
      </div>

      <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_1fr] gap-0 mb-4 px-4">
        <div />
        <div className="text-[9px] font-black text-accent-cyan uppercase tracking-[0.2em] text-center">
          {coinA.symbol.toUpperCase()}
        </div>
        <div className="w-8" />
        <div className="text-[9px] font-black text-accent-purple uppercase tracking-[0.2em] text-center">
          {coinB.symbol.toUpperCase()}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_1fr] gap-2 sm:gap-0 items-center p-3 sm:p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
          >
            <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
              {row.label}
            </div>
            <div className={`text-center font-bold text-sm ${row.winner === "A" ? "text-accent-cyan" : "text-white"}`}>
              {row.isPct ? <div className="flex justify-center"><PctCell value={row.rawA} /></div> : row.valA}
            </div>
            <div className="hidden sm:flex w-8 items-center justify-center">
              {row.winner && (
                <div className={`w-1.5 h-1.5 rounded-full ${row.winner === "A" ? "bg-accent-cyan shadow-[0_0_6px_#00F2FF]" : "bg-accent-purple shadow-[0_0_6px_#9D00FF]"}`} />
              )}
            </div>
            <div className={`text-center font-bold text-sm ${row.winner === "B" ? "text-accent-purple" : "text-white"}`}>
              {row.isPct ? <div className="flex justify-center"><PctCell value={row.rawB} /></div> : row.valB}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
