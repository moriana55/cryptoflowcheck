"use client";
import { useState } from "react";
import { PriceTicker } from "@/components/PriceTicker";
import { VitalSigns } from "@/components/VitalSigns";
import { TerminalScanner } from "@/components/TerminalScanner";
import { SiteHeader } from "@/components/SiteStructure";
import { SentimentGauge } from "@/components/MarketIntelligence";
import { CFCAssistant } from "@/components/IntelligenceAgent";
import { CoinLogo } from "@/components/CoinLogo";
import { toast } from "@/components/Toaster";
import { Search, Zap, TrendingUp, Filter, ArrowRightLeft, Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_COIN_MAP } from "@/lib/coins";
import type { Coin, GlobalMarketData } from "@/lib/types";

function TopMovers({ coins, category }: { coins: Coin[]; category: string }) {
  const filtered = category === "ALL"
    ? coins
    : coins.filter((c) => (c.category || DEFAULT_COIN_MAP[c.id]?.category) === category);

  const gainers = [...filtered]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
    .slice(0, 3);

  const losers = [...filtered]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0))
    .slice(0, 1);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight">
          Top <span className="text-gradient">Movers</span>
        </h2>
      </div>
      <div className="space-y-6">
        {gainers.map((coin) => (
          <Link href={`/coin/${coin.id}`} key={coin.id} className="glass-card cursor-pointer group hover:-translate-y-1 block">
            <div className="pulse-badge mb-4 !text-emerald-400 !border-emerald-400 !bg-emerald-400/10">
              <span className="pulse-dot !bg-emerald-400"></span> TOP GAINER
            </div>
            <div className="flex items-center gap-3 mb-3">
              <CoinLogo symbol={coin.symbol} size={32} />
              <h3 className="text-xl font-black leading-tight">{coin.name}</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              {coin.symbol.toUpperCase()} is up {coin.price_change_percentage_24h?.toFixed(2)}% in the last 24 hours.
              Current price: ${coin.current_price?.toLocaleString()}.
            </p>
            <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">
              Analyze →
            </span>
          </Link>
        ))}
        {losers.map((coin) => (
          <Link href={`/coin/${coin.id}`} key={coin.id} className="glass-card cursor-pointer group hover:-translate-y-1 block">
            <div className="pulse-badge mb-4 !text-red-400 !border-red-400 !bg-red-400/10">
              <span className="pulse-dot !bg-red-400"></span> TOP DECLINER
            </div>
            <div className="flex items-center gap-3 mb-3">
              <CoinLogo symbol={coin.symbol} size={32} />
              <h3 className="text-xl font-black leading-tight">{coin.name}</h3>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              {coin.symbol.toUpperCase()} is down {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}% in the last 24 hours.
              Current price: ${coin.current_price?.toLocaleString()}.
            </p>
            <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">
              Analyze →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

interface HomeClientProps {
  initialCoins: Coin[];
  initialFearGreed: number | null;
  initialGlobalData: GlobalMarketData | null;
}

export default function HomeClient({ initialCoins, initialFearGreed, initialGlobalData }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [coins] = useState<Coin[]>(initialCoins);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const cryptoCategories = ["ALL", "LAYER 1", "DEFI", "MEMES", "AI COINS", "GAMING"];

  function handleSearch() {
    const q = searchQuery.trim();
    if (q) router.push(`/markets?search=${encodeURIComponent(q)}`);
  }

  const totalMarketCap = initialGlobalData?.total_market_cap ?? null;
  const btcDominance = initialGlobalData?.btc_dominance ?? null;
  const marketCapChange24h = initialGlobalData?.market_cap_change_24h ?? null;
  const avgChange = coins.length > 0
    ? coins.reduce((sum, c) => sum + (c.price_change_percentage_24h ?? 0), 0) / coins.length
    : null;

  const topVolume = [...coins]
    .filter((c) => c.total_volume != null)
    .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
    .slice(0, 5);

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <div className="container mx-auto px-6 py-4 flex justify-end">
        <button
          onClick={() => toast("No active alerts yet", "info")}
          className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <Bell className="w-4 h-4 text-accent-cyan animate-swing" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Alerts</span>
          <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse shadow-[0_0_10px_#00F2FF]" />
        </button>
      </div>

      <main className="container mx-auto px-6 pb-20">
        {coins.length === 0 && (
          <div className="mb-6 glass-card border-red-400/20 text-red-400 text-xs font-bold text-center py-3">
            Could not load market data. Please refresh the page.
          </div>
        )}
        <VitalSigns
          totalMarketCap={totalMarketCap}
          btcDominance={btcDominance}
          marketCapChange24h={marketCapChange24h}
          avgChange={avgChange}
          fearGreed={initialFearGreed}
        />

        <section className="mb-12">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="SCAN COINS / TRACK WALLET ADDRESS"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-bg-card border-2 border-glass-border rounded-[32px] px-8 py-6 text-xl font-bold outline-none transition-all shadow-[0_0_50px_rgba(0,242,255,0.05)] focus:bg-black/40 focus:border-accent-cyan/30"
              />
              <button
                onClick={handleSearch}
                className="absolute right-4 top-4 bottom-4 px-8 text-bg-dark font-black text-xs uppercase tracking-widest rounded-2xl transition-all hover:scale-105 active:scale-95 bg-accent-cyan"
              >
                SEARCH CRYPTO
              </button>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-gray-500 shrink-0">
                <Filter className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase">Filter:</span>
              </div>
              {cryptoCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${activeCategory === cat ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/10' : 'border-white/5 bg-white/5 text-gray-500 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          <div className="min-w-0 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 rounded-full bg-accent-cyan" />
                <h2 className="text-2xl font-black tracking-tight uppercase">
                  Intelligence Feed
                </h2>
              </div>
              <Link href="/compare" className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-accent-cyan">
                <ArrowRightLeft className="w-4 h-4" />
                Launch VS Mode
              </Link>
            </div>

            <TopMovers coins={coins} category={activeCategory} />
          </div>

          <aside className="space-y-8">
            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
              Hybrid Sync: 100%
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00ffad]" />
                  Trending Now
                </h3>
              </div>
              <div className="space-y-4">
                {topVolume.length > 0 ? (
                  topVolume.map((item, i) => (
                    <Link href={`/coin/${item.id}`} key={item.id} className="flex items-center justify-between group cursor-pointer hover:translate-x-1 transition-transform">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-500">0{i+1}</span>
                        <CoinLogo symbol={item.symbol} size={20} />
                        <span className="text-[11px] font-bold text-white group-hover:text-accent-cyan transition-colors uppercase">{item.symbol}</span>
                      </div>
                      <span className={`text-[10px] font-black ${(item.price_change_percentage_24h ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {(item.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                        {(item.price_change_percentage_24h ?? 0).toFixed(2)}%
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="text-xs font-bold text-text-secondary">Loading trending data...</div>
                )}
              </div>
            </div>

            <TerminalScanner />
            <SentimentGauge />
          </aside>
        </div>

        <section className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Tracked Coins", val: coins.length > 0 ? coins.length.toString() : "—" },
            { label: "Active Markets", val: coins.length > 0 ? coins.length.toString() : "—" },
            { label: "Data Source", val: "Binance" },
            { label: "Update Frequency", val: "Realtime" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 text-center group hover:bg-white/[0.04] transition-all">
              <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">{stat.label}</div>
              <div className="text-2xl font-black text-white group-hover:text-accent-cyan transition-colors">{stat.val}</div>
            </div>
          ))}
        </section>
      </main>

      <CFCAssistant />

      <footer className="border-t border-white/5 py-20 mt-20 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 text-center">
          <h4 className="font-black text-3xl mb-8 tracking-tighter">
            CRYPTO<span className="text-gradient">FLOWCHECK</span>
          </h4>
          <div className="flex flex-wrap justify-center gap-12 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-12">
            <Link href="/markets" className="hover:text-white transition-colors">Markets</Link>
            <Link href="/exchanges" className="hover:text-white transition-colors">Exchanges</Link>
            <Link href="/heatmap" className="hover:text-white transition-colors">Heatmap</Link>
            <Link href="/events" className="hover:text-white transition-colors">Events</Link>
          </div>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest max-w-2xl mx-auto leading-loose">
            The information provided on CryptoFlowCheck.com is for informational purposes only. Not Financial Advice (NFA). Trade at your own risk. Built for the architects of the future.
          </p>
        </div>
      </footer>
    </div>
  );
}
