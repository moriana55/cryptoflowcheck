"use client";

import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ArrowUpRight, ArrowDownLeft, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { WalletBalance, WalletTx, WalletToken } from "@/lib/wallet";

function shortenAddr(addr: string) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

function formatETH(weiStr: string) {
  const eth = Number(BigInt(weiStr)) / 1e18;
  if (eth === 0) return "0 ETH";
  if (eth < 0.0001) return "<0.0001 ETH";
  if (eth < 1) return eth.toFixed(4) + " ETH";
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
}

export default function WalletClient({ balance, transactions, tokens }: Props) {
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
