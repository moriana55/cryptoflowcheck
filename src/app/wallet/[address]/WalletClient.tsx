"use client";

import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ArrowUpRight, ArrowDownLeft, Copy, ExternalLink, Lock, Download, AlertTriangle, TrendingUp } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import type { WalletBalance, WalletTx, WalletToken } from "@/lib/wallet";
import type { Tier } from "@/lib/tierLogic";
import type { WalletPnlReport } from "@/lib/walletPnl";
import { buildPnlCsv } from "@/lib/pnlCsv";

function usdSigned(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "Unknown";
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function usdPlain(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "Unknown";
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

function pnlColor(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "text-on-surface-variant";
  if (n > 0) return "text-primary";
  if (n < 0) return "text-error";
  return "text-on-surface";
}

function PnlSection({ tier, pnl }: { tier: Tier; pnl: WalletPnlReport | null }) {
  if (tier !== "pro" || !pnl) {
    return (
      <div className="glass-panel p-6 rounded-xl mb-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-geist text-headline-sm text-on-surface">Wallet PnL &amp; Tax Report</h2>
              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest">Pro</span>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-2xl">
              FIFO cost-basis analysis of this wallet&apos;s ETH movements: realized &amp; unrealized
              profit/loss, a year-by-year breakdown, and a tax-ready CSV export.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 mt-4 px-5 py-2 bg-primary text-on-primary font-geist text-label-md font-bold rounded-lg hover:brightness-110 transition-all"
            >
              Unlock with Pro <TrendingUp className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const s = pnl.summary;

  function downloadCsv() {
    try {
      const csv = buildPnlCsv({
        address: pnl!.address,
        generatedAt: pnl!.generatedAt,
        currentPriceUSD: pnl!.currentPriceUSD,
        summary: pnl!.summary,
        yearly: pnl!.yearly,
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cryptoflowcheck-pnl-${pnl!.address.slice(0, 10)}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // download unavailable — ignore silently
    }
  }

  const metrics: { label: string; value: string; color: string }[] = [
    { label: "Realized PnL", value: usdSigned(s.realizedPnlUSD), color: pnlColor(s.realizedPnlUSD) },
    { label: "Unrealized PnL", value: usdSigned(s.unrealizedPnlUSD), color: pnlColor(s.unrealizedPnlUSD) },
    { label: "Total PnL", value: usdSigned(s.totalPnlUSD), color: pnlColor(s.totalPnlUSD) },
    { label: "Holdings", value: `${s.remainingETH.toFixed(4)} ETH`, color: "text-on-surface" },
  ];

  return (
    <div className="glass-panel rounded-xl mb-6 overflow-hidden !p-0">
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-geist text-label-md font-bold uppercase tracking-widest">PnL &amp; Tax Report</h2>
          <span className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest">Pro</span>
          <span className="font-mono text-[10px] text-on-surface-variant">FIFO · Native ETH</span>
        </div>
        <button
          onClick={downloadCsv}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary font-geist text-label-md font-bold rounded-lg hover:bg-primary/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> CSV
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="bg-surface-container-low rounded-lg p-3 border border-outline-variant/10">
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">{m.label}</p>
            <p className={`font-mono text-lg font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {pnl.yearly.length > 0 && (
        <div className="px-4 pb-4">
          <div className="overflow-x-auto rounded-lg border border-outline-variant/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest">
                  <th className="text-left font-bold p-3">Year</th>
                  <th className="text-right font-bold p-3">Proceeds</th>
                  <th className="text-right font-bold p-3">Cost basis</th>
                  <th className="text-right font-bold p-3">Realized PnL</th>
                  <th className="text-right font-bold p-3">Disposals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {pnl.yearly.map((y) => (
                  <tr key={y.year}>
                    <td className="p-3 font-mono text-on-surface">{y.year}</td>
                    <td className="p-3 text-right font-mono text-on-surface-variant">{usdPlain(y.proceedsUSD)}</td>
                    <td className="p-3 text-right font-mono text-on-surface-variant">{usdPlain(y.costBasisUSD)}</td>
                    <td className={`p-3 text-right font-mono font-bold ${pnlColor(y.realizedPnlUSD)}`}>{usdSigned(y.realizedPnlUSD)}</td>
                    <td className="p-3 text-right font-mono text-on-surface-variant">
                      {y.knownDisposals}
                      {y.unknownDisposals > 0 && (
                        <span className="text-tertiary"> (+{y.unknownDisposals}?)</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {s.flags.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          {s.flags.map((f, i) => (
            <p key={i} className="flex gap-2 text-tertiary text-[11px] leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>{f}</span>
            </p>
          ))}
        </div>
      )}

      <div className="px-4 pb-4 pt-1 border-t border-outline-variant/10">
        <p className="text-on-surface-variant text-[10px] leading-relaxed">
          Estimated, FIFO, native-ETH only ({pnl.ethMovements} ETH transfers from {pnl.txConsidered} transactions
          analyzed; price coverage: {pnl.priceCoverage}). For informational purposes only — not tax or financial
          advice. Verify with your tax advisor before filing.
        </p>
      </div>
    </div>
  );
}

function shortenAddr(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatETH(weiStr: string) {
  let eth: number;
  try {
    eth = Number(BigInt(weiStr || "0")) / 1e18;
  } catch {
    // Malformed value (null/decimal/non-numeric) — fail soft instead of crashing.
    return "0 ETH";
  }
  if (!Number.isFinite(eth) || eth === 0) return "0 ETH";
  if (eth < 0.0001) return "<0.0001 ETH";
  return eth.toFixed(4) + " ETH";
}

function timeAgo(ts: string) {
  const diff = (Date.now() - new Date(ts).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTokenBalance(value: string, decimals: string | number | null) {
  if (!value || value === "0") return "0";
  try {
    const d = Number(decimals);
    const safeDecimals = Number.isFinite(d) && d >= 0 ? d : 18;
    const num = Number(BigInt(value)) / Math.pow(10, safeDecimals);
    if (num < 0.0001) return "<0.0001";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  } catch {
    return "0";
  }
}

interface Props {
  balance: WalletBalance;
  transactions: WalletTx[];
  tokens: WalletToken[];
  tier: Tier;
  pnl: WalletPnlReport | null;
}

export default function WalletClient({ balance, transactions, tokens, tier, pnl }: Props) {
  const [copied, setCopied] = useState(false);
  const addr = balance.address;
  const isLower = addr.toLowerCase();

  function copyAddress() {
    try {
      navigator.clipboard?.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable (insecure origin / denied) — ignore silently
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <SiteHeader />

      <main className="max-w-container-max mx-auto px-gutter pt-8 pb-20">
        <div className="glass-panel p-6 rounded-xl mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-geist text-label-md text-on-surface-variant uppercase tracking-widest mb-1">ETHEREUM WALLET</p>
              {balance.ensName && (
                <p className="font-geist text-headline-sm text-primary mb-1">{balance.ensName}</p>
              )}
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-on-surface-variant break-all">{addr}</span>
                <button onClick={copyAddress} className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors" title="Copy">
                  <Copy className="w-4 h-4 text-on-surface-variant" />
                </button>
                <a href={`https://etherscan.io/address/${addr}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors">
                  <ExternalLink className="w-4 h-4 text-on-surface-variant" />
                </a>
              </div>
              {copied && <span className="text-primary text-xs font-bold mt-1 block">Copied!</span>}
            </div>
            <div className="text-right">
              <p className="font-mono text-headline-lg text-primary">{balance.balanceETH.toFixed(4)} ETH</p>
              {balance.balanceUSD != null && (
                <p className="font-mono text-body-md text-on-surface-variant">
                  ≈ ${balance.balanceUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          </div>
        </div>

        <PnlSection tier={tier} pnl={pnl} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8">
            <div className="glass-panel rounded-xl overflow-hidden !p-0">
              <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                <h2 className="font-geist text-label-md font-bold uppercase tracking-widest">Recent Transactions</h2>
                <span className="font-mono text-[10px] text-on-surface-variant">{transactions.length} txns</span>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {transactions.length > 0 ? transactions.map((tx) => {
                  const isIncoming = tx.to?.hash?.toLowerCase() === isLower;
                  return (
                    <div key={tx.hash} className="p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isIncoming ? "bg-primary/10" : "bg-error/10"
                        }`}>
                          {isIncoming
                            ? <ArrowDownLeft className="w-4 h-4 text-primary" />
                            : <ArrowUpRight className="w-4 h-4 text-error" />
                          }
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-geist text-xs font-bold uppercase ${isIncoming ? "text-primary" : "text-error"}`}>
                              {isIncoming ? "IN" : "OUT"}
                            </span>
                            <a href={`https://etherscan.io/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-on-surface-variant hover:text-primary transition-colors truncate">
                              {tx.hash.slice(0, 16)}...
                            </a>
                          </div>
                          <p className="font-mono text-[10px] text-on-surface-variant mt-0.5">
                            {isIncoming ? "From" : "To"}: {shortenAddr(isIncoming ? tx.from.hash : (tx.to?.hash || "Contract"))}
                            {tx.timestamp ? ` · ${timeAgo(tx.timestamp)}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className={`font-mono text-sm font-bold ${isIncoming ? "text-primary" : "text-on-surface"}`}>
                          {isIncoming ? "+" : "-"}{formatETH(tx.value)}
                        </span>
                        {tx.status === "error" && (
                          <span className="block text-[9px] font-bold text-error uppercase">Failed</span>
                        )}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-8 text-center text-on-surface-variant text-sm">No transactions found</div>
                )}
              </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-gutter">
            <div className="glass-panel rounded-xl overflow-hidden !p-0">
              <div className="p-4 bg-surface-container-low border-b border-outline-variant/20">
                <h3 className="font-geist text-label-md font-bold uppercase tracking-widest">Token Balances</h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {tokens.length > 0 ? tokens.map((t) => (
                  <div key={t.token.address} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-geist text-sm font-bold text-on-surface">{t.token.symbol}</span>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">{t.token.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-on-surface font-bold">
                        {formatTokenBalance(t.value, t.token.decimals)}
                      </span>
                      <a href={`https://etherscan.io/token/${t.token.address}?a=${addr}`} target="_blank" rel="noopener noreferrer" className="block text-primary text-[10px] font-geist font-bold hover:underline mt-0.5">
                        VIEW
                      </a>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-on-surface-variant text-xs">No tokens found</div>
                )}
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl">
              <p className="font-geist text-label-md text-on-surface-variant uppercase tracking-widest mb-3">Quick Stats</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant text-xs">Transactions</span>
                  <span className="font-mono text-xs text-on-surface font-bold">{transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant text-xs">Tokens</span>
                  <span className="font-mono text-xs text-on-surface font-bold">{tokens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant text-xs">Network</span>
                  <span className="font-mono text-xs text-primary font-bold">Ethereum</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
