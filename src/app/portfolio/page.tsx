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
  getHoldings,
  upsertHolding,
  removeHolding,
  computePnL,
  portfolioTotals,
  type Holding,
} from "@/lib/portfolio";
import { getWatches } from "@/lib/alerts";
import { getAnalysisHistory } from "@/lib/analysisHistory";
import {
  Briefcase,
  Plus,
  Trash2,
  TriangleAlert,
  Download,
  Lock,
} from "lucide-react";

const DROP_THRESHOLD = 5; // %

export default function PortfolioPage() {
  const live = useLivePrices();
  const { isPro, loading: tierLoading } = useTier();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [fallback, setFallback] = useState<
    Record<string, { price: number; change24h: number }>
  >({});
  const [exporting, setExporting] = useState(false);

  const coinList = useMemo(() => getCoinList(), []);

  // form state
  const [coinId, setCoinId] = useState("bitcoin");
  const [amount, setAmount] = useState("");
  const [avgCost, setAvgCost] = useState("");

  useEffect(() => {
    setHoldings(getHoldings());
    const onChange = () => setHoldings(getHoldings());
    window.addEventListener("portfolio-change", onChange);
    return () => window.removeEventListener("portfolio-change", onChange);
  }, []);

  // REST fallback so P&L works even before the websocket warms up.
  useEffect(() => {
    fetchBinanceCoins(coinList)
      .then((data) => {
        const map: Record<string, { price: number; change24h: number }> = {};
        data.forEach((c, i) => {
          const pair = coinList[i]?.pair;
          if (pair && c.current_price != null) {
            map[pair] = {
              price: c.current_price,
              change24h: c.price_change_percentage_24h ?? 0,
            };
          }
        });
        setFallback(map);
      })
      .catch(() => {});
  }, [coinList]);

  const priceMap = useMemo(() => {
    const map: Record<string, { price: number; change24h: number }> = {
      ...fallback,
    };
    for (const [pair, p] of Object.entries(live)) {
      map[pair] = { price: p.price, change24h: p.change24h };
    }
    return map;
  }, [live, fallback]);

  const rows = useMemo(
    () => computePnL(holdings, priceMap, DROP_THRESHOLD),
    [holdings, priceMap]
  );
  const totals = useMemo(() => portfolioTotals(rows), [rows]);
  const alerts = rows.filter((r) => r.dropAlert);

  function handleAdd() {
    const meta = coinList.find((c) => c.id === coinId);
    if (!meta) return;
    const amt = Number(amount);
    const cost = Number(avgCost);
    if (!(amt > 0) || !(cost >= 0)) {
      toast("Enter a valid amount and average cost", "error");
      return;
    }
    upsertHolding({
      id: meta.id,
      pair: meta.pair,
      symbol: meta.symbol,
      name: meta.name,
      amount: amt,
      avgCost: cost,
    });
    setAmount("");
    setAvgCost("");
    toast("Holding saved", "success");
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdings: getHoldings(),
          watches: getWatches(),
          history: getAnalysisHistory(),
        }),
      });
      if (res.status === 403) {
        toast("CSV export is a Pro feature.", "error");
        return;
      }
      if (!res.ok) {
        toast("Export failed. Try again.", "error");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cryptoflowcheck-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast("Export ready", "success");
    } catch {
      toast("Network error", "error");
    } finally {
      setExporting(false);
    }
  }

  function fmt(val: number | null, dollar = true) {
    if (val == null) return "—";
    const sign = dollar ? "$" : "";
    return (
      sign +
      val.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })
    );
  }

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-accent-cyan" />
              <span>
                Portfolio <span className="text-gradient">Tracker</span>
              </span>
            </h1>
            <p className="text-text-secondary text-sm max-w-lg">
              Track holdings and live P&amp;L from public Binance prices. Coins
              that dropped more than {DROP_THRESHOLD}% in 24h are flagged.
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || tierLoading}
            title={isPro ? "Export everything to CSV" : "Pro feature"}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-50 ${
              isPro
                ? "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20"
                : "border-white/10 bg-white/5 text-text-secondary"
            }`}
          >
            {isPro ? (
              <Download className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {!isPro && !tierLoading && (
          <div className="glass-card mb-6 flex items-center justify-between gap-4 py-4">
            <span className="text-xs font-bold text-text-secondary">
              CSV export of your portfolio, watches and analysis history is a Pro
              feature.
            </span>
            <Link
              href="/pricing"
              className="shrink-0 px-3 py-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-accent-cyan hover:bg-accent-cyan/20 transition-all"
            >
              Upgrade
            </Link>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card">
            <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">
              Market Value
            </div>
            <div className="text-xl font-black">{fmt(totals.value)}</div>
          </div>
          <div className="glass-card">
            <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">
              Cost Basis
            </div>
            <div className="text-xl font-black">{fmt(totals.cost)}</div>
          </div>
          <div className="glass-card">
            <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">
              Total P&amp;L
            </div>
            <div
              className={`text-xl font-black ${
                totals.pnl >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {totals.pnl >= 0 ? "+" : ""}
              {fmt(totals.pnl)}
            </div>
          </div>
          <div className="glass-card">
            <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">
              Return
            </div>
            <div
              className={`text-xl font-black ${
                totals.pnlPercent >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {totals.pnlPercent >= 0 ? "+" : ""}
              {totals.pnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Drop alerts */}
        {alerts.length > 0 && (
          <div className="glass-card mb-8 border-amber-400/20">
            <div className="flex items-center gap-2 mb-3">
              <TriangleAlert className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Daily Drop Alerts (&gt;{DROP_THRESHOLD}% down)
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alerts.map((a) => (
                <span
                  key={a.id}
                  className="px-3 py-1.5 rounded-lg bg-red-400/10 border border-red-400/20 text-xs font-black text-red-400"
                >
                  {a.symbol.toUpperCase()} {a.change24h?.toFixed(1)}%
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add holding */}
        <div className="glass-card mb-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4">
            Add / Update Holding
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select
              value={coinId}
              onChange={(e) => setCoinId(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/30"
            >
              {coinList.map((c) => (
                <option key={c.id} value={c.id} className="bg-bg-dark">
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/30"
            />
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Avg cost (USD)"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/30"
            />
            <button
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-accent-cyan text-bg-dark font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4" /> Save
            </button>
          </div>
        </div>

        {/* Holdings table */}
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                <th className="px-4 py-4">Coin</th>
                <th className="px-4 py-4">Amount</th>
                <th className="px-4 py-4">Avg Cost</th>
                <th className="px-4 py-4">Live Price</th>
                <th className="px-4 py-4">24h</th>
                <th className="px-4 py-4">Value</th>
                <th className="px-4 py-4">P&amp;L</th>
                <th className="px-4 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-sm font-bold text-text-secondary"
                  >
                    No holdings yet. Add one above to start tracking P&amp;L.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <CoinLogo symbol={r.symbol} size={28} />
                        <div>
                          <div className="text-sm font-bold">{r.name}</div>
                          <div className="text-[10px] font-black text-text-secondary uppercase">
                            {r.symbol}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold">{r.amount}</td>
                    <td className="px-4 py-4 text-sm font-bold text-text-secondary">
                      {fmt(r.avgCost)}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold">
                      {fmt(r.livePrice)}
                    </td>
                    <td className="px-4 py-4">
                      {r.change24h != null ? (
                        <span
                          className={`text-xs font-black ${
                            r.change24h >= 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {r.change24h >= 0 ? "+" : ""}
                          {r.change24h.toFixed(2)}%
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-bold">
                      {fmt(r.marketValue)}
                    </td>
                    <td className="px-4 py-4">
                      {r.pnl != null ? (
                        <span
                          className={`text-sm font-black ${
                            r.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {r.pnl >= 0 ? "+" : ""}
                          {fmt(r.pnl)}
                          {r.pnlPercent != null && (
                            <span className="text-[10px] ml-1 opacity-70">
                              ({r.pnlPercent >= 0 ? "+" : ""}
                              {r.pnlPercent.toFixed(1)}%)
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => {
                          removeHolding(r.id);
                          toast("Holding removed", "info");
                        }}
                        className="text-white/20 hover:text-red-400 transition-colors"
                        aria-label="Remove holding"
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
