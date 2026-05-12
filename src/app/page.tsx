"use client";
import { useEffect, useState } from "react";
import { PriceTicker } from "@/components/PriceTicker";
import { VitalSigns } from "@/components/VitalSigns";
import { TerminalScanner } from "@/components/TerminalScanner";
import { SiteHeader, IntelligenceFeed } from "@/components/SiteStructure";
import { MarketHeatmap, SentimentGauge } from "@/components/MarketIntelligence";
import { Search, Shield, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[100] bg-bg-dark flex flex-col items-center justify-center">
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-4 relative">
          <div className="absolute inset-0 bg-accent-cyan animate-[marquee_1.5s_infinite]"></div>
        </div>
        <h2 className="text-gradient font-black text-xl tracking-[0.2em] animate-pulse">INITIALIZING DEEP SCAN...</h2>
        <p className="text-text-secondary text-[10px] mt-2 font-mono">Accessing Blockchain Nodes via CryptoFlow Engine</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PriceTicker />
      <SiteHeader />
      
      <main className="container mx-auto px-6 pb-20">
        <VitalSigns />

        {/* Search Engine */}
        <section className="mb-12">
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="SCAN BLOCKCHAIN / TRACK WALLET ADDRESS"
                className="w-full bg-bg-card border-2 border-glass-border rounded-3xl px-8 py-5 text-xl font-bold outline-none group-hover:border-accent-cyan/30 transition-all shadow-[0_0_40px_rgba(0,242,255,0.05)]"
              />
              <button className="absolute right-3 top-3 bottom-3 px-6 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform">
                SCAN ENGINE
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Main Feed */}
          <IntelligenceFeed />

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
              All Nodes Nominal // Syncing...
            </div>

            <TerminalScanner />
            <SentimentGauge />
            <MarketHeatmap />

            {/* Risk Radar */}
            <div className="glass-card">
              <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan">
                Token Risk Radar
              </div>
              <div className="space-y-3">
                {[
                  { label: "BTC", status: "Safe", color: "text-emerald-400 bg-emerald-400/10" },
                  { label: "PEPE", status: "Mid Risk", color: "text-amber-400 bg-amber-400/10" },
                  { label: "SHIB", status: "High Risk", color: "text-red-500 bg-red-500/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Newsletter */}
        <section className="mt-20 glass-card bg-linear-to-br from-accent-cyan/5 to-accent-purple/5 border-glass-border p-12 text-center">
          <h2 className="text-3xl font-black mb-4">Join The <span className="text-gradient">Elite Flow</span> Network</h2>
          <p className="text-text-secondary text-sm mb-8">Receive real-time blockchain intelligence before the retail market.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Your intelligence email"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:border-accent-cyan/50"
            />
            <button className="px-10 py-4 bg-linear-to-br from-accent-cyan to-accent-purple rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              Join Elite
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 mt-20 bg-bg-dark/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="max-w-xs">
              <h4 className="font-black text-lg mb-4 tracking-tight">
                CRYPTO<span className="text-gradient">FLOWCHECK</span>
              </h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                Professional-grade on-chain analysis and real-time flow tracking. Deciphering the signals of the shadow market.
              </p>
            </div>
            <div className="max-w-xs">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-white mb-4">Legal Disclaimer</h5>
              <p className="text-text-secondary text-[10px] leading-relaxed">
                The information provided on CryptoFlowCheck.com is for informational purposes only. Not Financial Advice (NFA). Trade at your own risk.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-8 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Risk Disclosure</Link>
            </div>
            <p className="text-[10px] font-bold text-text-secondary">
              © 2026 <span className="text-gradient">CryptoFlowCheck.com</span>. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
