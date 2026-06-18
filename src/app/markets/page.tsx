"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { useLivePrices } from "@/lib/useLivePrices";
import { getWatchlist, toggleWatchlist, isWatchlisted as checkWatchlisted } from "@/lib/watchlist";
import { fetchBinanceCoins } from "@/lib/binance";
import { getCoinList } from "@/lib/coins";
import { Search, ArrowUpDown, Star } from "lucide-react";
import Link from "next/link";
import { CoinLogo } from "@/components/CoinLogo";
import { toast } from "@/components/Toaster";
import type { Coin } from "@/lib/types";

interface MarketCoin extends Coin {
  pair: string;
}

type SortKey = "market_cap" | "current_price" | "price_change_percentage_24h" | "total_volume";
type SortDir = "asc" | "desc";

export default function MarketsPage() {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");
  const [sortKey, setSortKey] = useState<SortKey>("market_cap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [watchFilter, setWatchFilter] = useState<"all" | "watchlist">("all");
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const live = useLivePrices();

  useEffect(() => {
    setWatchlist(getWatchlist());
    const list = getCoinList();
    fetchBinanceCoins(list)
      .then((data) => {
        setCoins(data.map((c, i) => ({ ...c, pair: list[i]?.pair || "" })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleStar(id: string) {
    const added = toggleWatchlist(id);
    setWatchlist(getWatchlist());
    toast(added ? "Added to watchlist" : "Removed from watchlist", "success");
  }

  const filtered = useMemo(() => {
    let list = coins.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.symbol.toLowerCase().includes(query.toLowerCase())
    );
    if (watchFilter === "watchlist") {
      list = list.filter((c) => watchlist.includes(c.id));
    }
    list.sort((a, b) => {
      const av = a[sortKey] ?? -Infinity;
      const bv = b[sortKey] ?? -Infinity;
      if (av === bv) return 0;
      return sortDir === "asc" ? (av > bv ? 1 : -1) : bv > av ? 1 : -1;
    });
    return list;
  }, [coins, query, sortKey, sortDir, watchFilter, watchlist]);

  function formatCurrency(val: number | null) {
    if (val == null) return "—";
    if (val >= 1_000_000_000) return "$" + (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000) return "$" + (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000) return "$" + (val / 1_000).toFixed(2) + "K";
    return "$" + val.toLocaleString("en-US", { maximumFractionDigits: 4 });
  }

  function formatPrice(val: number | null) {
    if (val == null) return "—";
    if (val >= 1)
      return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "$" + val.toPrecision(4);
  }

  function getLiveData(coin: MarketCoin) {
    const liveData = live[coin.pair];
    if (!liveData) {
      return {
        price: coin.current_price,
        change: coin.price_change_percentage_24h,
        direction: "neutral" as const,
      };
    }
    return {
      price: liveData.price,
      change: liveData.change24h,
      direction: liveData.direction,
    };
  }

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3 px-2.5 py-1 rounded-full border border-primary/20 bg-primary/5">
            <span className="pulse-dot text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              Live · Binance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Markets <span className="text-gradient">Overview</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Real-time market data powered by Binance. Track prices, market cap, and volume for top cryptocurrencies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
            <input
              type="text"
              placeholder="Search coins by name or symbol..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-surface-container/70 border border-outline-variant/60 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold outline-none placeholder:text-text-secondary/60 focus:border-accent-cyan/50 focus:bg-surface-container transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWatchFilter("all")}
              className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                watchFilter === "all"
                  ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                  : "border-white/5 bg-white/5 text-gray-500 hover:text-white"
              }`}
            >
              All Coins
            </button>
            <button
              onClick={() => setWatchFilter("watchlist")}
              className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                watchFilter === "watchlist"
                  ? "border-amber-400 text-amber-400 bg-amber-400/10"
                  : "border-white/5 bg-white/5 text-gray-500 hover:text-white"
              }`}
            >
              <Star className="w-3 h-3" /> Watchlist ({watchlist.length})
            </button>
          </div>
        </div>

        <div className="glass-card !p-0 overflow-x-auto relative after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:bg-gradient-to-l after:from-bg-card after:to-transparent after:pointer-events-none md:after:hidden">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-outline-variant/60 text-[10px] font-black uppercase tracking-widest text-text-secondary bg-surface-container-low/60 sticky top-0 z-10 backdrop-blur-sm">
                <th className="px-4 py-3.5 w-10"></th>
                <th className="px-4 py-3.5 w-12">#</th>
                <th className="px-4 py-3.5">Coin</th>
                {(
                  [
                    ["current_price", "Price"],
                    ["price_change_percentage_24h", "24h %"],
                    ["market_cap", "Market Cap"],
                    ["total_volume", "Volume"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <th
                    key={key}
                    className={`px-4 py-3.5 cursor-pointer transition-colors select-none hover:text-on-surface ${
                      sortKey === key ? "text-accent-cyan" : ""
                    }`}
                    onClick={() => toggleSort(key)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <ArrowUpDown
                        className={`w-3 h-3 transition-opacity ${
                          sortKey === key ? "opacity-100" : "opacity-40"
                        }`}
                      />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-outline-variant/30">
                    <td colSpan={8} className="px-6 py-[18px]">
                      <div className="h-4 skeleton rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-sm font-bold text-text-secondary">
                    {watchFilter === "watchlist"
                      ? "Your watchlist is empty. Star some coins to add them here."
                      : "No coins found matching your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((coin, i) => {
                  const liveData = getLiveData(coin);
                  const isWatched = watchlist.includes(coin.id);
                  return (
                    <tr
                      key={coin.id}
                      className={`border-b border-outline-variant/30 hover:bg-surface-container-high/40 transition-colors ${
                        liveData.direction === "up"
                          ? "flash-up"
                          : liveData.direction === "down"
                          ? "flash-down"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleStar(coin.id)}
                          aria-label={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                          className={`transition-colors ${
                            isWatched
                              ? "text-amber-400"
                              : "text-on-surface-variant/30 hover:text-amber-400/70"
                          }`}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={isWatched ? "currentColor" : "none"}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-4 font-mono text-xs font-bold text-text-secondary">
                        {i + 1}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/coin/${coin.id}`}
                          className="flex items-center gap-3 group"
                        >
                          <CoinLogo symbol={coin.symbol} size={32} />
                          <div>
                            <div className="text-sm font-bold group-hover:text-accent-cyan transition-colors">
                              {coin.name}
                            </div>
                            <div className="text-[10px] font-black text-text-secondary uppercase tracking-wider">
                              {coin.symbol}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-bold text-on-surface">
                        {formatPrice(liveData.price)}
                      </td>
                      <td className="px-4 py-4">
                        {liveData.change != null ? (
                          <span
                            className={`inline-flex font-mono text-xs font-black tabular-nums ${
                              liveData.change >= 0
                                ? "text-bullish-green"
                                : "text-bearish-red"
                            }`}
                          >
                            {liveData.change >= 0 ? "+" : ""}
                            {liveData.change.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-text-secondary">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-semibold text-on-surface-variant">
                        {formatCurrency(coin.market_cap)}
                      </td>
                      <td className="px-4 py-4 font-mono text-sm font-semibold text-on-surface-variant">
                        {formatCurrency(coin.total_volume)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/compare?a=${coin.id}&b=ethereum`}
                            className="px-3 py-1.5 bg-surface-container-high border border-outline-variant/60 rounded-lg text-[10px] font-black uppercase tracking-wider text-on-surface-variant hover:bg-accent-cyan/10 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
                          >
                            VS
                          </Link>
                          <Link
                            href={`/coin/${coin.id}`}
                            className="px-3 py-1.5 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg text-[10px] font-black uppercase tracking-wider text-accent-cyan hover:bg-accent-cyan/20 transition-all"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
