"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback } from "react";
import { EXCHANGES, type Exchange } from "@/data/exchanges";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { ExchangeSelector } from "@/components/compare/ExchangeSelector";
import { ArrowLeft, Trophy, Lock, TrendingUp, Zap, HeartHandshake, Star, ArrowLeftRight } from "lucide-react";
import Link from "next/link";

const SCORE_FIELDS = [
  { key: "securityScore" as const, label: "Security", icon: Lock },
  { key: "liquidityScore" as const, label: "Liquidity", icon: TrendingUp },
  { key: "easeOfUseScore" as const, label: "Ease of Use", icon: HeartHandshake },
  { key: "featuresScore" as const, label: "Features", icon: Zap },
  { key: "supportScore" as const, label: "Support", icon: HeartHandshake },
  { key: "trustScore" as const, label: "Trust", icon: Star },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const a = searchParams.get("a") || "binance";
  const b = searchParams.get("b") || "coinbase";

  const exA = EXCHANGES.find((e) => e.id === a) || EXCHANGES[0];
  const exB = EXCHANGES.find((e) => e.id === b) || EXCHANGES[1];

  const [selA, setSelA] = useState<Exchange>(exA);
  const [selB, setSelB] = useState<Exchange>(exB);

  const handleSelectA = useCallback((ex: Exchange) => {
    if (ex.id === selB.id) {
      setSelB(selA);
      setSelA(ex);
      router.replace(`/compare/exchanges?a=${ex.id}&b=${selA.id}`, { scroll: false });
    } else {
      setSelA(ex);
      router.replace(`/compare/exchanges?a=${ex.id}&b=${selB.id}`, { scroll: false });
    }
  }, [selA, selB, router]);

  const handleSelectB = useCallback((ex: Exchange) => {
    if (ex.id === selA.id) {
      setSelA(selB);
      setSelB(ex);
      router.replace(`/compare/exchanges?a=${selB.id}&b=${ex.id}`, { scroll: false });
    } else {
      setSelB(ex);
      router.replace(`/compare/exchanges?a=${selA.id}&b=${ex.id}`, { scroll: false });
    }
  }, [selA, selB, router]);

  const swapExchanges = () => {
    setSelA(selB);
    setSelB(selA);
    router.replace(`/compare/exchanges?a=${selB.id}&b=${selA.id}`, { scroll: false });
  };

  const winner = selA.overallRating >= selB.overallRating ? selA : selB;
  const isTie = selA.overallRating === selB.overallRating;
  const aWins = selA.overallRating >= selB.overallRating;

  return (
    <div>
      {/* SELECTORS */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 mb-10">
        <ExchangeSelector selected={selA} onSelect={handleSelectA} accent="cyan" label="Exchange A" />

        <button
          onClick={swapExchanges}
          className="self-center sm:self-end sm:mb-1 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-white/10 bg-bg-card hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all group shrink-0"
        >
          <ArrowLeftRight className="w-4 h-4 text-text-secondary group-hover:text-accent-cyan transition-colors" />
        </button>

        <ExchangeSelector selected={selB} onSelect={handleSelectB} accent="purple" label="Exchange B" />
      </div>

      {/* HEADER CARDS */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        {/* Exchange A */}
        <div className="flex-1 text-center relative">
          {aWins && !isTie && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Winner
            </div>
          )}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-4 border-2 ${
              aWins && !isTie
                ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan shadow-[0_0_30px_rgba(0,242,255,0.15)]"
                : "bg-white/5 border-white/10 text-white"
            }`}
          >
            {selA.name.slice(0, 2)}
          </div>
          <h2 className="text-2xl font-black">{selA.name}</h2>
          <div className="text-5xl font-black mt-3 text-accent-cyan">
            {selA.overallRating}
            <span className="text-lg text-text-secondary ml-1">/10</span>
          </div>
        </div>

        {/* VS Badge */}
        <div className="flex flex-col items-center px-6">
          <div className="w-16 h-16 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center mb-3">
            <span className="text-lg font-black text-white">VS</span>
          </div>
          {isTie ? (
            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Draw
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              {winner.name}
            </span>
          )}
        </div>

        {/* Exchange B */}
        <div className="flex-1 text-center relative">
          {!aWins && !isTie && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400/10 border border-amber-400/30 rounded-full text-[9px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Winner
            </div>
          )}
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-4 border-2 ${
              !aWins && !isTie
                ? "bg-accent-purple/10 border-accent-purple text-accent-purple shadow-[0_0_30px_rgba(157,0,255,0.15)]"
                : "bg-white/5 border-white/10 text-white"
            }`}
          >
            {selB.name.slice(0, 2)}
          </div>
          <h2 className="text-2xl font-black">{selB.name}</h2>
          <div className="text-5xl font-black mt-3 text-accent-purple">
            {selB.overallRating}
            <span className="text-lg text-text-secondary ml-1">/10</span>
          </div>
        </div>
      </div>

      {/* SCORE BARS */}
      <div className="glass-card mb-8 p-6 md:p-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-8">
          Score Breakdown
        </h3>
        <div className="space-y-6">
          {SCORE_FIELDS.map((field) => {
            const valA = selA[field.key];
            const valB = selB[field.key];
            const aHigher = valA >= valB;
            return (
              <div key={field.key}>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className={aHigher ? "text-accent-cyan" : "text-text-secondary"}>
                    {valA}
                  </span>
                  <span className="text-text-secondary uppercase tracking-wider text-[10px]">
                    {field.label}
                  </span>
                  <span className={!aHigher ? "text-accent-purple" : "text-text-secondary"}>
                    {valB}
                  </span>
                </div>
                <div className="relative h-2.5 bg-white/5 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-accent-cyan rounded-l-full transition-all"
                    style={{ width: `${valA * 10}%` }}
                  />
                  <div className="w-px bg-bg-dark" />
                  <div
                    className="h-full bg-accent-purple rounded-r-full transition-all"
                    style={{ width: `${valB * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SPECS TABLE */}
      <div className="glass-card mb-8 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-text-secondary">
              <th className="px-6 py-4">Feature</th>
              <th className="px-6 py-4 text-center">{selA.name}</th>
              <th className="px-6 py-4 text-center">{selB.name}</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Spot Fee", a: selA.spotFee, b: selB.spotFee },
              { label: "Futures Fee", a: selA.futuresFee, b: selB.futuresFee },
              {
                label: "KYC",
                a: selA.kycRequired,
                b: selB.kycRequired,
                highlight: true,
              },
              { label: "Max Leverage", a: selA.maxLeverage, b: selB.maxLeverage },
              { label: "Founded", a: selA.founded.toString(), b: selB.founded.toString() },
              { label: "Headquarters", a: selA.headquarters, b: selB.headquarters },
              {
                label: "Fiat Support",
                a: selA.fiatSupport.join(", "),
                b: selB.fiatSupport.join(", "),
              },
              { label: "Languages", a: selA.languages.toString(), b: selB.languages.toString() },
              {
                label: "Mobile Rating",
                a: selA.mobileRating + "/5",
                b: selB.mobileRating + "/5",
              },
            ].map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                  {row.label}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-center">{row.a}</td>
                <td className="px-6 py-4 text-sm font-bold text-center">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PROS & CONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div className="space-y-6">
          <div className="glass-card border-l-2 border-emerald-400">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">
              Pros: {selA.name}
            </h4>
            <ul className="space-y-3">
              {selA.pros.map((p, i) => (
                <li
                  key={i}
                  className="text-sm text-text-secondary flex items-start gap-3"
                >
                  <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card border-l-2 border-red-400">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-4">
              Cons: {selA.name}
            </h4>
            <ul className="space-y-3">
              {selA.cons.map((c, i) => (
                <li
                  key={i}
                  className="text-sm text-text-secondary flex items-start gap-3"
                >
                  <span className="text-red-400 mt-0.5 text-xs">✗</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card border-l-2 border-emerald-400">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-4">
              Pros: {selB.name}
            </h4>
            <ul className="space-y-3">
              {selB.pros.map((p, i) => (
                <li
                  key={i}
                  className="text-sm text-text-secondary flex items-start gap-3"
                >
                  <span className="text-emerald-400 mt-0.5 text-xs">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card border-l-2 border-red-400">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-4">
              Cons: {selB.name}
            </h4>
            <ul className="space-y-3">
              {selB.cons.map((c, i) => (
                <li
                  key={i}
                  className="text-sm text-text-secondary flex items-start gap-3"
                >
                  <span className="text-red-400 mt-0.5 text-xs">✗</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Swap */}
      <div className="flex justify-center">
        <Link
          href={`/compare/exchanges?a=${selB.id}&b=${selA.id}`}
          className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-cyan/10 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
        >
          Swap Positions
        </Link>
      </div>
    </div>
  );
}

export default function CompareExchangesPage() {
  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />
      <main className="container mx-auto px-6 py-12">
        <Link
          href="/exchanges"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Exchanges
        </Link>
        <Suspense
          fallback={
            <div className="glass-card text-center py-12">
              <div className="text-sm font-bold text-text-secondary animate-pulse">
                Loading comparison...
              </div>
            </div>
          }
        >
          <CompareContent />
        </Suspense>
      </main>
    </div>
  );
}
