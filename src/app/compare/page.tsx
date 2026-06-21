"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { CoinSelector } from "@/components/compare/CoinSelector";
import { CompareTable } from "@/components/compare/CompareTable";
import { ArrowLeftRight, Zap, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { type BlogPost } from "@/lib/admin";
import { generateCompareInsight } from "@/lib/ai";
import { CoinLogo } from "@/components/CoinLogo";
import { fetchBinanceCoinDetail } from "@/lib/binance";
import { getCoinMap } from "@/lib/coins";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  market_cap_rank?: number;
}

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image?: string | null;
  current_price?: number;
  market_cap?: number | null;
  total_volume?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number | null;
  price_change_percentage_30d?: number | null;
  circulating_supply?: number | null;
  total_supply?: number | null;
  max_supply?: number | null;
  ath?: number | null;
  ath_change_percentage?: number | null;
  ath_date?: string | null;
  atl?: number | null;
  atl_date?: string | null;
}

const DEFAULT_A: Coin = { id: "bitcoin", symbol: "btc", name: "Bitcoin" };
const DEFAULT_B: Coin = { id: "ethereum", symbol: "eth", name: "Ethereum" };

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest animate-pulse">Loading...</div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [coinA, setCoinA] = useState<Coin>(DEFAULT_A);
  const [coinB, setCoinB] = useState<Coin>(DEFAULT_B);
  const [detailA, setDetailA] = useState<CoinDetail | null>(null);
  const [detailB, setDetailB] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    if (a) setCoinA({ id: a, symbol: a, name: a });
    if (b) setCoinB({ id: b, symbol: b, name: b });
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const map = getCoinMap();
    const metaA = map[coinA.id];
    const metaB = map[coinB.id];
    if (!metaA || !metaB) {
      setError("Coin not found in local database.");
      setLoading(false);
      return;
    }
    Promise.all([
      fetchBinanceCoinDetail(metaA),
      fetchBinanceCoinDetail(metaB),
    ]).then(([a, b]) => {
      if ("error" in a || "error" in b) {
        setError("Binance API unavailable. Rate limit or network issue.");
        setLoading(false);
        return;
      }
      setDetailA({ ...a, id: coinA.id });
      setDetailB({ ...b, id: coinB.id });
      setCoinA((prev) => ({ ...prev, name: a.name, symbol: a.symbol }));
      setCoinB((prev) => ({ ...prev, name: b.name, symbol: b.symbol }));
      setLoading(false);
    }).catch(() => {
      setError("Could not reach Binance API. Check your connection.");
      setLoading(false);
    });
  }, [coinA.id, coinB.id]);

  useEffect(() => {
    const url = `/compare?a=${coinA.id}&b=${coinB.id}`;
    router.replace(url, { scroll: false });
  }, [coinA.id, coinB.id, router]);

  function swapCoins() {
    setCoinA(coinB);
    setCoinB(coinA);
  }

  function handleSelectA(coin: Coin) {
    if (coin.id === coinB.id) swapCoins();
    else setCoinA(coin);
  }

  function handleSelectB(coin: Coin) {
    if (coin.id === coinA.id) swapCoins();
    else setCoinB(coin);
  }

  useEffect(() => {
    if (!detailA && !detailB) {
      setRelatedPosts([]);
      return;
    }
    let cancelled = false;
    // Pull from the shared server blog store (same source the public /blog pages
    // and the daily AI cron use) — visitor localStorage is always empty here.
    fetch("/api/blog")
      .then((r) => (r.ok ? r.json() : []))
      .then((posts: BlogPost[]) => {
        if (cancelled || !Array.isArray(posts)) return;
        const ids = [detailA?.id, detailB?.id].filter(Boolean) as string[];
        const syms = [detailA?.symbol, detailB?.symbol]
          .filter(Boolean)
          .map((s) => s?.toLowerCase()) as string[];
        const related = posts.filter((p) => {
          const lower = (p.title + " " + p.content + " " + (p.tags || []).join(" ")).toLowerCase();
          return ids.some((id) => lower.includes(id.toLowerCase())) || syms.some((sym) => lower.includes(sym));
        });
        setRelatedPosts(related);
      })
      .catch(() => {
        if (!cancelled) setRelatedPosts([]);
      });
    setAiInsight(null);
    return () => {
      cancelled = true;
    };
  }, [detailA, detailB]);

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-cyan/5 border border-accent-cyan/20 rounded-full mb-4">
            <Zap className="w-3 h-3 text-accent-cyan" />
            <span className="text-[10px] font-black text-accent-cyan uppercase tracking-[0.2em]">Live Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Compare <span className="text-gradient">Crypto Assets</span>
          </h1>
          <p className="text-text-secondary text-sm mt-2 max-w-lg mx-auto">
            Side-by-side analysis with real-time market data, price charts, and key metrics.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 mb-10">
          <CoinSelector selected={coinA} onSelect={handleSelectA} accent="cyan" label="Coin A" />

          <button
            onClick={swapCoins}
            className="self-center sm:self-end sm:mb-1 w-12 h-12 flex items-center justify-center rounded-xl border-2 border-white/10 bg-bg-card hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all group shrink-0"
          >
            <ArrowLeftRight className="w-4 h-4 text-text-secondary group-hover:text-accent-cyan transition-colors" />
          </button>

          <CoinSelector selected={coinB} onSelect={handleSelectB} accent="purple" label="Coin B" />
        </div>

        {error && (
          <div className="glass-card mb-10 text-center py-8">
            <div className="text-red-400 text-sm font-bold mb-2">{error}</div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                setCoinA({ ...coinA });
              }}
              className="px-4 py-2 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl text-[10px] font-black text-accent-cyan uppercase tracking-widest hover:bg-accent-cyan/20 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="glass-card mb-10 text-center py-12">
            <div className="text-text-secondary text-sm font-bold animate-pulse">Loading market data...</div>
          </div>
        )}

        {detailA && detailB && !loading && !error && (
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="glass-card flex items-center gap-4">
              <CoinLogo symbol={detailA.symbol} size={40} />
              <div>
                <div className="text-lg font-black">{detailA.current_price != null ? (detailA.current_price >= 1 ? "$" + detailA.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "$" + detailA.current_price.toPrecision(4)) : "—"}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-text-secondary uppercase">{detailA.symbol}</span>
                  {detailA.price_change_percentage_24h != null && (
                    <span className={`text-[10px] font-black ${detailA.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {detailA.price_change_percentage_24h >= 0 ? "+" : ""}{detailA.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="glass-card flex items-center gap-4">
              <CoinLogo symbol={detailB.symbol} size={40} />
              <div>
                <div className="text-lg font-black">{detailB.current_price != null ? (detailB.current_price >= 1 ? "$" + detailB.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "$" + detailB.current_price.toPrecision(4)) : "—"}</div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-text-secondary uppercase">{detailB.symbol}</span>
                  {detailB.price_change_percentage_24h != null && (
                    <span className={`text-[10px] font-black ${detailB.price_change_percentage_24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {detailB.price_change_percentage_24h >= 0 ? "+" : ""}{detailB.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <CompareTable coinA={detailA} coinB={detailB} loading={loading} />

        {/* Related Intelligence */}
        {detailA && detailB && !loading && (
          <section className="mt-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black tracking-tight">
                Related <span className="text-gradient">Intelligence</span>
              </h2>
              <button
                onClick={async () => {
                  setAiLoading(true);
                  try {
                    const insight = await generateCompareInsight(detailA.name, detailB.name);
                    setAiInsight(insight);
                  } catch {
                    alert("AI insight failed.");
                  } finally {
                    setAiLoading(false);
                  }
                }}
                disabled={aiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-accent-purple/10 border border-accent-purple/30 rounded-xl text-[10px] font-black text-accent-purple uppercase tracking-widest hover:bg-accent-purple/20 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {aiLoading ? "Analyzing..." : "AI Insight"}
              </button>
            </div>

            {aiInsight && (
              <div className="glass-card mb-6">
                <div className="text-[10px] font-black text-accent-purple uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> AI Comparison Insight
                </div>
                <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-line">{aiInsight}</div>
              </div>
            )}

            {relatedPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="glass-card hover:-translate-y-1 transition-transform"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-accent-cyan" />
                      <span className="text-[10px] font-black text-text-secondary uppercase">{post.date}</span>
                    </div>
                    <h3 className="text-sm font-black mb-1">{post.title}</h3>
                    <p className="text-[11px] text-text-secondary line-clamp-2">{post.excerpt}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-card text-center py-8">
                <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">No related blog posts yet</div>
                <p className="text-xs text-text-secondary">Write a blog post about these coins or generate an AI insight above.</p>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-white/5 py-12 mt-20 bg-black/40 backdrop-blur-xl">
        <div className="container mx-auto px-6 text-center">
          <Link href="/" className="font-black text-xl tracking-tighter hover:opacity-80 transition-opacity">
            CRYPTO<span className="text-gradient">FLOWCHECK</span>
          </Link>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest mt-4 max-w-xl mx-auto">
            Not Financial Advice (NFA). Trade at your own risk.
          </p>
        </div>
      </footer>
    </div>
  );
}
