"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { CoinLogo } from "@/components/CoinLogo";
import { toast } from "@/components/Toaster";
import { useLivePrices } from "@/lib/useLivePrices";
import { fetchBinanceCoins } from "@/lib/binance";
import { getCoinList } from "@/lib/coins";
import { useTier } from "@/lib/useTier";
import {
  getWatches,
  addWatch,
  removeWatch,
  evaluateWatches,
  isAdvancedMetric,
  type Watch,
  type WatchMetric,
  type WatchDirection,
} from "@/lib/alerts";
import { Bell, Plus, Trash2, BellRing, Crown, Lock } from "lucide-react";

export default function AlertsPage() {
  const live = useLivePrices();
  const { isPro, loading: tierLoading } = useTier();
  const [watches, setWatches] = useState<Watch[]>([]);
  const [vol, setVol] = useState<Record<string, number>>({});

  const coinList = useMemo(() => getCoinList(), []);

  // form
  const [coinId, setCoinId] = useState("bitcoin");
  const [metric, setMetric] = useState<WatchMetric>("price");
  const [direction, setDirection] = useState<WatchDirection>("above");
  const [threshold, setThreshold] = useState("");

  useEffect(() => {
    setWatches(getWatches());
    const onChange = () => setWatches(getWatches());
    window.addEventListener("watches-change", onChange);
    return () => window.removeEventListener("watches-change", onChange);
  }, []);

  // Volume isn't on the websocket ticker map shape; pull it from REST.
  useEffect(() => {
    fetchBinanceCoins(coinList)
      .then((data) => {
        const map: Record<string, number> = {};
        data.forEach((c, i) => {
          const pair = coinList[i]?.pair;
          if (pair && c.total_volume != null) map[pair] = c.total_volume;
        });
        setVol(map);
      })
      .catch(() => {});
  }, [coinList]);

  const dataMap = useMemo(() => {
    const map: Record<
      string,
      { price: number; change24h: number; volume: number }
    > = {};
    for (const c of coinList) {
      const l = live[c.pair];
      map[c.pair] = {
        price: l?.price ?? 0,
        change24h: l?.change24h ?? 0,
        volume: vol[c.pair] ?? 0,
      };
    }
    return map;
  }, [coinList, live, vol]);

  const evaluated = useMemo(
    () => evaluateWatches(watches, dataMap),
    [watches, dataMap]
  );
  const triggered = evaluated.filter((w) => w.triggered);

  const advancedSelected = isAdvancedMetric(metric);

  function handleAdd() {
    const meta = coinList.find((c) => c.id === coinId);
    if (!meta) return;
    const t = Number(threshold);
    if (!Number.isFinite(t)) {
      toast("Enter a valid threshold", "error");
      return;
    }
    // Defensive client-side gate. (Watches persist locally; server-side pro
    // enforcement lives in /api/tier + the export endpoint. We still block the
    // advanced-watch UX for free users so the gate is consistent.)
    if (advancedSelected && !isPro) {
      toast("Volume/whale watches are a Pro feature.", "error");
      return;
    }
    addWatch({
      coinId: meta.id,
      pair: meta.pair,
      symbol: meta.symbol,
      name: meta.name,
      metric,
      direction,
      threshold: t,
    });
    setThreshold("");
    toast("Watch added", "success");
  }

  function metricLabel(m: WatchMetric) {
    if (m === "price") return "Price (USD)";
    if (m === "change24h") return "24h Change (%)";
    return "24h Volume (USD)";
  }

  function fmtValue(m: WatchMetric, v: number | null) {
    if (v == null) return "—";
    if (m === "change24h") return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
    if (m === "volume") return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
    return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 4 });
  }

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <Bell className="w-7 h-7 text-accent-cyan" />
            <span>
              Threshold &amp; Whale <span className="text-gradient">Alerts</span>
            </span>
          </h1>
          <p className="text-text-secondary text-sm max-w-xl">
            Watch coins and set thresholds on price or 24h change. Triggered
            watches appear in the digest below. Volume / whale watches are a Pro
            feature.
          </p>
        </div>

        {/* Triggered digest */}
        <div className="glass-card mb-8 border-accent-cyan/20">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="w-4 h-4 text-accent-cyan" />
            <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan">
              Triggered Digest ({triggered.length})
            </span>
          </div>
          {triggered.length === 0 ? (
            <p className="text-xs font-bold text-text-secondary">
              No watches are currently triggered. They will light up here when a
              threshold is crossed.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {triggered.map((w) => (
                <span
                  key={w.id}
                  className="px-3 py-1.5 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-xs font-black text-accent-cyan"
                >
                  {w.symbol.toUpperCase()} {w.metric} {w.direction}{" "}
                  {fmtValue(w.metric, w.threshold)} → now{" "}
                  {fmtValue(w.metric, w.currentValue)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Add watch */}
        <div className="glass-card mb-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4">
            Add Watch
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <select
              value={coinId}
              onChange={(e) => setCoinId(e.target.value)}
              className="bg-surface-container/70 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50 focus:bg-surface-container transition-colors"
            >
              {coinList.map((c) => (
                <option key={c.id} value={c.id} className="bg-bg-dark">
                  {c.symbol.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as WatchMetric)}
              className="bg-surface-container/70 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50 focus:bg-surface-container transition-colors"
            >
              <option value="price" className="bg-bg-dark">
                Price (USD)
              </option>
              <option value="change24h" className="bg-bg-dark">
                24h Change (%)
              </option>
              <option value="volume" className="bg-bg-dark">
                Volume {isPro ? "" : "🔒 Pro"}
              </option>
            </select>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as WatchDirection)}
              className="bg-surface-container/70 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50 focus:bg-surface-container transition-colors"
            >
              <option value="above" className="bg-bg-dark">
                Above
              </option>
              <option value="below" className="bg-bg-dark">
                Below
              </option>
            </select>
            <input
              type="number"
              step="any"
              placeholder="Threshold"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="bg-surface-container/70 border border-outline-variant/60 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/50 focus:bg-surface-container transition-colors"
            />
            <button
              onClick={handleAdd}
              disabled={advancedSelected && !isPro && !tierLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan text-bg-dark font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {advancedSelected && !isPro ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </button>
          </div>
          {advancedSelected && !isPro && !tierLoading && (
            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-amber-400">
              <Crown className="w-3.5 h-3.5" />
              Volume / whale watches need Pro.
              <Link href="/pricing" className="underline hover:text-amber-300">
                Upgrade
              </Link>
            </div>
          )}
        </div>

        {/* Watch list */}
        <div className="glass-card !p-0 overflow-x-auto">
          <table className="w-full text-left min-w-[680px]">
            <thead>
              <tr className="border-b border-outline-variant/60 text-[10px] font-black uppercase tracking-widest text-text-secondary bg-surface-container-low/60">
                <th className="px-4 py-4">Coin</th>
                <th className="px-4 py-4">Metric</th>
                <th className="px-4 py-4">Condition</th>
                <th className="px-4 py-4">Current</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm font-bold text-text-secondary"
                  >
                    No watches yet. Add one above.
                  </td>
                </tr>
              ) : (
                evaluated.map((w) => (
                  <tr
                    key={w.id}
                    className="border-b border-outline-variant/30 hover:bg-surface-container-high/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <CoinLogo symbol={w.symbol} size={26} />
                        <span className="text-sm font-bold uppercase">
                          {w.symbol}
                        </span>
                        {w.advanced && (
                          <Crown className="w-3 h-3 text-accent-cyan" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs font-bold text-text-secondary">
                      {metricLabel(w.metric)}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold">
                      {w.direction} {fmtValue(w.metric, w.threshold)}
                    </td>
                    <td className="px-4 py-4 text-xs font-bold">
                      {fmtValue(w.metric, w.currentValue)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                          w.triggered
                            ? "bg-accent-cyan/10 text-accent-cyan"
                            : "bg-white/5 text-text-secondary"
                        }`}
                      >
                        {w.triggered ? "Triggered" : "Watching"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          removeWatch(w.id);
                          toast("Watch removed", "info");
                        }}
                        className="text-on-surface-variant/40 hover:text-bearish-red transition-colors"
                        aria-label="Remove watch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
