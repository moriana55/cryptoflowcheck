"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { EXCHANGES } from "@/data/exchanges";
import { ArrowRightLeft, Star, Shield, TrendingUp, Globe, Zap } from "lucide-react";
import Link from "next/link";

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
              <select
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/30 transition-colors"
              >
                {EXCHANGES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
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
              <select
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-purple/30 transition-colors"
              >
                {EXCHANGES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
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
