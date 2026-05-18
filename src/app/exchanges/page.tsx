"use client";

import { useState, useRef, useEffect } from "react";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { EXCHANGES } from "@/data/exchanges";
import { ArrowRightLeft, Star, Shield, TrendingUp, Globe, Zap, ChevronDown, Check } from "lucide-react";
import Link from "next/link";

function ExchangeDropdown({ value, onChange, accent = "cyan" }: { value: string; onChange: (v: string) => void; accent?: "cyan" | "purple" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = EXCHANGES.find(e => e.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const borderOpen = accent === "cyan" ? "border-accent-cyan/40" : "border-accent-purple/40";
  const activeBg = accent === "cyan" ? "bg-accent-cyan/10 text-accent-cyan" : "bg-accent-purple/10 text-accent-purple";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full bg-white/5 border rounded-2xl px-4 py-3 text-sm font-bold outline-none transition-all flex items-center justify-between gap-2 hover:bg-white/[0.07] ${open ? `${borderOpen} bg-white/[0.08]` : "border-white/10"}`}
      >
        <span>{selected?.name ?? "Select"}</span>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#1a1d2e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-xl">
          {EXCHANGES.map(e => (
            <button
              key={e.id}
              type="button"
              onClick={() => { onChange(e.id); setOpen(false); }}
              className={`w-full px-4 py-3 text-left text-sm font-bold flex items-center justify-between transition-colors ${e.id === value ? activeBg : "text-white/80 hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                  {e.name.slice(0, 2)}
                </div>
                <span>{e.name}</span>
              </div>
              {e.id === value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExchangesPage() {
  const [selectedA, setSelectedA] = useState(EXCHANGES[0].id);
  const [selectedB, setSelectedB] = useState(EXCHANGES[1].id);

  const exchangeA = EXCHANGES.find((e) => e.id === selectedA);
  const exchangeB = EXCHANGES.find((e) => e.id === selectedB);

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Exchange <span className="text-gradient">Arena</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Compare the world&apos;s top cryptocurrency exchanges side-by-side. Real scores, real data, no bullshit.
          </p>
        </div>

        {/* Quick Compare Bar */}
        <div className="glass-card mb-12 p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary mb-2 block">
                Exchange A
              </label>
              <ExchangeDropdown value={selectedA} onChange={setSelectedA} accent="cyan" />
            </div>

            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary mb-2 block">
                Exchange B
              </label>
              <ExchangeDropdown value={selectedB} onChange={setSelectedB} accent="purple" />
            </div>

            <div className="flex items-end">
              <Link
                href={`/compare/exchanges?a=${selectedA}&b=${selectedB}`}
                className="h-[46px] px-8 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                Fight
              </Link>
            </div>
          </div>
        </div>

        {/* Exchange Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXCHANGES.map((exchange) => (
            <div
              key={exchange.id}
              className="glass-card group hover:border-accent-cyan/30 transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black uppercase text-white group-hover:border-accent-cyan/30 transition-colors">
                    {exchange.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">
                      {exchange.name}
                    </h3>
                    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
                      Est. {exchange.founded}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-accent-cyan">
                    {exchange.overallRating}
                  </div>
                  <div className="text-[9px] font-bold text-text-secondary uppercase">
                    / 10
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Security
                  </span>
                  <span className="font-black">{exchange.securityScore}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Liquidity
                  </span>
                  <span className="font-black">{exchange.liquidityScore}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Features
                  </span>
                  <span className="font-black">{exchange.featuresScore}/10</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-bold flex items-center gap-1.5">
                    <Globe className="w-3 h-3" /> Spot Fee
                  </span>
                  <span className="font-black">{exchange.spotFee}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-5 border-t border-white/5">
                <span
                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                    exchange.kycRequired === "None"
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : exchange.kycRequired === "Optional"
                      ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                      : "bg-red-400/10 text-red-400 border border-red-400/20"
                  }`}
                >
                  KYC: {exchange.kycRequired}
                </span>
                <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white/5 text-text-secondary border border-white/10">
                  {exchange.maxLeverage}
                </span>
              </div>

              <a
                href={exchange.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl text-[10px] font-black text-accent-cyan uppercase tracking-widest hover:bg-accent-cyan/20 hover:scale-[1.02] transition-all"
              >
                Trade on {exchange.name} →
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
