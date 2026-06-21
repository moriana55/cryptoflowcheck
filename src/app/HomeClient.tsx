"use client";
import { useState } from "react";
import { PriceTicker } from "@/components/PriceTicker";
import { VitalSigns } from "@/components/VitalSigns";
import { TerminalScanner } from "@/components/TerminalScanner";
import { SiteHeader } from "@/components/SiteStructure";
import { SentimentGauge } from "@/components/MarketIntelligence";
import { CFCAssistant } from "@/components/IntelligenceAgent";
import { CoinLogo } from "@/components/CoinLogo";
import { Filter, ArrowRightLeft, TrendingUp } from "lucide-react";
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
    <section className="space-y-4">
      <h3 className="font-geist text-headline-sm mb-6">
        Top <span className="text-secondary">Movers</span>
      </h3>
      <div className="grid grid-cols-1 gap-stack-md">
        {gainers.map((coin) => (
          <Link href={`/coin/${coin.id}`} key={coin.id} className="glass-panel p-stack-md rounded-xl hover:bg-surface-container-high transition-all group block">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center p-2 border border-outline-variant/10">
                  <CoinLogo symbol={coin.symbol} size={32} />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-sm mb-1 uppercase tracking-wider">TOP GAINER</span>
                  <h4 className="font-geist text-headline-sm">{coin.name}</h4>
                  <p className="text-on-surface-variant text-sm mt-1">
                    {coin.symbol.toUpperCase()} is up{" "}
                    <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold text-xs">
                      ↑{coin.price_change_percentage_24h?.toFixed(2)}%
                    </span>{" "}
                    in the last 24 hours. Current price: <span className="text-on-surface font-mono font-bold">${coin.current_price?.toLocaleString()}</span>.
                  </p>
                </div>
              </div>
              <span className="text-primary font-geist text-label-md flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
                ANALYZE <TrendingUp className="w-3 h-3" />
              </span>
            </div>
          </Link>
        ))}
        {losers.map((coin) => (
          <Link href={`/coin/${coin.id}`} key={coin.id} className="glass-panel p-stack-md rounded-xl hover:bg-surface-container-high transition-all group block">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center p-2 border border-outline-variant/10">
                  <CoinLogo symbol={coin.symbol} size={32} />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded-sm mb-1 uppercase tracking-wider">TOP DECLINER</span>
                  <h4 className="font-geist text-headline-sm">{coin.name}</h4>
                  <p className="text-on-surface-variant text-sm mt-1">
                    {coin.symbol.toUpperCase()} is down{" "}
                    <span className="inline-flex items-center gap-0.5 bg-error/10 text-error px-1.5 py-0.5 rounded font-bold text-xs">
                      ↓{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </span>{" "}
                    in the last 24 hours. Current price: <span className="text-on-surface font-mono font-bold">${coin.current_price?.toLocaleString()}</span>.
                  </p>
                </div>
              </div>
              <span className="text-error font-geist text-label-md flex items-center gap-1 group-hover:gap-2 transition-all shrink-0">
                ANALYZE <TrendingUp className="w-3 h-3" />
              </span>
            </div>
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
    if (!q) return;
    if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      router.push(`/wallet/${q}`);
    } else {
      router.push(`/markets?search=${encodeURIComponent(q)}`);
    }
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
    <div className="min-h-screen bg-background">
      <PriceTicker />
      <SiteHeader />

      <main className="max-w-container-max mx-auto px-gutter pt-8 pb-20">
        {coins.length === 0 && (
          <div className="mb-6 glass-panel border-error/20 text-error text-xs font-bold text-center py-3">
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

        <section className="mb-stack-lg">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 mb-stack-md border-outline-variant/30">
            <input
              type="text"
              placeholder="SCAN COINS / TRACK WALLET ADDRESS"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-transparent border-none focus:ring-0 text-on-surface w-full font-manrope text-body-lg placeholder:text-on-surface-variant/40 outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-primary-container text-on-primary-container font-bold font-geist text-label-md px-8 py-3 rounded-lg hover:opacity-90 transition-all shrink-0"
            >
              SEARCH CRYPTO
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="font-geist text-label-md text-on-surface-variant mr-2">FILTER:</span>
            {cryptoCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-lg font-geist text-label-md transition-all border ${
                  activeCategory === cat
                    ? "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
                    : "bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:bg-surface-container-highest"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 space-y-stack-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-primary-container rounded-full" />
                <h2 className="font-geist text-headline-sm font-bold tracking-tight">Intelligence Feed</h2>
              </div>
              <Link href="/compare" className="flex items-center gap-2 px-4 py-2 border border-outline-variant/30 rounded-lg text-primary font-geist text-label-md hover:bg-primary/10 transition-all">
                <ArrowRightLeft className="w-4 h-4" />
                LAUNCH VS MODE
              </Link>
            </div>

            <TopMovers coins={coins} category={activeCategory} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-stack-lg">
              {[
                { label: "TRACKED COINS", val: coins.length > 0 ? coins.length.toString() : "—" },
                { label: "ACTIVE MARKETS", val: coins.length > 0 ? coins.length.toString() : "—" },
                { label: "DATA SOURCE", val: "Binance", accent: true },
                { label: "UPDATE FREQUENCY", val: "Realtime", primary: true },
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl text-center">
                  <p className="font-geist text-xs text-on-surface-variant mb-1">{stat.label}</p>
                  <p className={`font-geist text-headline-sm font-bold ${
                    stat.primary ? "text-primary" : stat.accent ? "text-primary-container" : "text-on-surface"
                  }`}>
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-gutter">
            <div className="glass-panel p-3 rounded-xl flex items-center justify-between border-outline-variant/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
                <span className="font-geist text-[10px] text-on-surface-variant">HYBRID SYNC: 100%</span>
              </div>
              <span className="font-mono text-[10px] text-primary-container">v3.4.1</span>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden border-outline-variant/30 !p-0">
              <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary-container" />
                <h3 className="font-geist text-label-md font-bold">TRENDING NOW</h3>
              </div>
              <div className="divide-y divide-outline-variant/10">
                {topVolume.length > 0 ? (
                  topVolume.map((item, i) => (
                    <Link href={`/coin/${item.id}`} key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-container-high transition-colors block">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-on-surface-variant">0{i + 1}</span>
                        <CoinLogo symbol={item.symbol} size={20} />
                        <span className="font-bold text-on-surface uppercase text-sm">{item.symbol}</span>
                      </div>
                      <span className={`font-mono text-sm font-bold ${
                        (item.price_change_percentage_24h ?? 0) >= 0 ? "text-primary" : "text-error"
                      }`}>
                        {(item.price_change_percentage_24h ?? 0) >= 0 ? "+" : ""}
                        {(item.price_change_percentage_24h ?? 0).toFixed(2)}%
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="p-4 text-xs font-bold text-on-surface-variant">Loading trending data...</div>
                )}
              </div>
            </div>

            <TerminalScanner />
            <SentimentGauge />
          </aside>
        </div>
      </main>

      <CFCAssistant />

      <footer className="bg-surface-container-lowest pt-stack-lg pb-12 mt-12 border-t border-outline-variant/10">
        <div className="max-w-container-max mx-auto px-gutter">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-outline-variant/10 pb-8">
            <div className="mb-6 md:mb-0">
              <div className="font-manrope text-body-lg font-bold text-on-surface mb-2 tracking-tighter">CRYPTOFLOWCHECK</div>
              <p className="text-on-surface-variant text-sm max-w-sm">Built for the architects of the future. High-velocity blockchain intelligence for professional traders.</p>
            </div>
            <div className="flex flex-wrap gap-8 font-geist text-label-md text-on-surface-variant">
              <Link href="/markets" className="hover:text-primary transition-colors">MARKETS</Link>
              <Link href="/exchanges" className="hover:text-primary transition-colors">EXCHANGES</Link>
              <Link href="/heatmap" className="hover:text-primary transition-colors">HEATMAP</Link>
              <Link href="/events" className="hover:text-primary transition-colors">EVENTS</Link>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-on-surface-variant font-geist tracking-widest gap-4">
            <div>© 2024 CRYPTOFLOWCHECK. REAL-TIME BLOCKCHAIN INTELLIGENCE.</div>
            <div className="flex gap-6">
              <span className="hover:text-primary transition-colors cursor-pointer">PRIVACY POLICY</span>
              <span className="hover:text-primary transition-colors cursor-pointer">TERMS OF SERVICE</span>
              <span className="hover:text-primary transition-colors cursor-pointer">STATUS</span>
            </div>
          </div>
          <p className="text-center mt-12 text-[10px] text-on-surface-variant/40 max-w-3xl mx-auto leading-relaxed">
            THE INFORMATION PROVIDED ON CRYPTOFLOWCHECK.COM IS FOR INFORMATIONAL PURPOSES ONLY. NOT FINANCIAL ADVICE (NFA). TRADE AT YOUR OWN RISK. BUILT FOR THE ARCHITECTS OF THE FUTURE.
          </p>
        </div>
      </footer>
    </div>
  );
}
