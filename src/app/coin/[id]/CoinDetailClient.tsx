"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { useLivePrice } from "@/lib/useLivePrices";
import {
  getWatchlist,
  toggleWatchlist,
} from "@/lib/watchlist";
import { getCoinMap } from "@/lib/coins";
import { fetchBinanceCoinDetail, fetchBinanceChart } from "@/lib/binance";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Layers,
  ArrowRightLeft,
  Star,
} from "lucide-react";
import Link from "next/link";
import { CoinLogo } from "@/components/CoinLogo";
import { toast } from "@/components/Toaster";
import { createChart, ColorType, LineStyle, LineSeries } from "lightweight-charts";

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d: number | null;
  price_change_percentage_30d: number | null;
  circulating_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  atl: number | null;
  ath_change_percentage: number | null;
}

export default function CoinDetailClient() {
  const { id } = useParams<{ id: string }>();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [meta, setMeta] = useState<{ pair: string; symbol: string; name: string; circulatingSupply: number | null; maxSupply: number | null } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<ReturnType<typeof createChart> | null>(null);

  const live = useLivePrice(meta?.pair || "");

  useEffect(() => {
    setWatchlist(getWatchlist());
  }, []);

  useEffect(() => {
    if (!id) return;
    const map = getCoinMap();
    const m = map[id];
    if (m) setMeta(m);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const map = getCoinMap();
    const coinMeta = map[id];
    if (!coinMeta) {
      setCoin(null);
      setLoading(false);
      return;
    }
    fetchBinanceCoinDetail(coinMeta)
      .then((data) => {
        setCoin("error" in data ? null : { ...data, id });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!chartRef.current || !id) return;
    const map = getCoinMap();
    const coinMeta = map[id];
    if (!coinMeta) return;

    fetchBinanceChart(coinMeta.pair, days)
      .then((prices) => {
        if (!prices.length || !chartRef.current) return;

        if (chartInstance.current) {
          chartInstance.current.remove();
          chartInstance.current = null;
        }

        const chart = createChart(chartRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: "transparent" },
            textColor: "#8E96A4",
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
          },
          grid: {
            vertLines: { color: "rgba(255,255,255,0.03)" },
            horzLines: { color: "rgba(255,255,255,0.03)" },
          },
          crosshair: {
            vertLine: {
              color: "rgba(0,242,255,0.3)",
              width: 1,
              style: LineStyle.Dashed,
            },
            horzLine: {
              color: "rgba(0,242,255,0.3)",
              width: 1,
              style: LineStyle.Dashed,
            },
          },
          rightPriceScale: {
            borderColor: "rgba(255,255,255,0.05)",
            visible: true,
          },
          timeScale: {
            borderColor: "rgba(255,255,255,0.05)",
            timeVisible: days <= 7,
          },
          width: chartRef.current.clientWidth,
          height: 420,
        });

        const series = chart.addSeries(LineSeries, {
          color: "#00F2FF",
          lineWidth: 2,
          priceScaleId: "right",
          crosshairMarkerBackgroundColor: "#00F2FF",
        });

        series.setData(
          prices.map(([t, v]) => ({
            time: Math.floor(t / 1000) as any,
            value: v,
          }))
        );

        chart.timeScale().fitContent();
        chartInstance.current = chart;

        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            chart.applyOptions({ width: entry.contentRect.width });
          }
        });
        if (chartRef.current) observer.observe(chartRef.current);

        return () => observer.disconnect();
      });
  }, [id, days]);

  const timeframes = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "1Y", value: 365 },
  ];

  function formatPrice(val: number | null) {
    if (val == null) return "—";
    if (val >= 1)
      return (
        "$" +
        val.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    return "$" + val.toPrecision(4);
  }

  function formatCurrency(val: number | null) {
    if (val == null) return "—";
    if (val >= 1_000_000_000)
      return "$" + (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000)
      return "$" + (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000) return "$" + (val / 1_000).toFixed(2) + "K";
    return "$" + val.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function formatNumber(val: number | null) {
    if (val == null) return "—";
    if (val >= 1_000_000_000)
      return (val / 1_000_000_000).toFixed(2) + "B";
    if (val >= 1_000_000) return (val / 1_000_000).toFixed(2) + "M";
    if (val >= 1_000) return (val / 1_000).toFixed(2) + "K";
    return val.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function formatPercent(val: number | null) {
    if (val == null) return "—";
    const fixed = val.toFixed(2);
    return (val >= 0 ? "+" : "") + fixed + "%";
  }

  function handleStar() {
    if (!id) return;
    const added = toggleWatchlist(id);
    setWatchlist(getWatchlist());
    toast(added ? "Added to watchlist" : "Removed from watchlist", "success");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center">
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden mb-4 relative">
          <div className="absolute inset-0 bg-accent-cyan animate-[marquee_1.5s_infinite]"></div>
        </div>
        <h2 className="text-gradient font-black text-xl tracking-[0.2em] animate-pulse uppercase">
          Loading coin data...
        </h2>
      </div>
    );
  }

  if (!coin) {
    return (
      <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-black text-white mb-4">Coin not found</h2>
        <Link
          href="/markets"
          className="px-8 py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all"
        >
          Back to Markets
        </Link>
      </div>
    );
  }

  const currentPrice = live?.price ?? coin.current_price;
  const currentChange = live?.change24h ?? coin.price_change_percentage_24h;
  const isPositive24h = (currentChange ?? 0) >= 0;
  const isWatched = id ? watchlist.includes(id) : false;
  const priceFlash = live?.direction === "up" ? "flash-up" : live?.direction === "down" ? "flash-down" : "";

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />
      <main className="container mx-auto px-6 py-12">
        <Link
          href="/markets"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Markets
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <CoinLogo symbol={coin.symbol} size={48} />
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  {coin.name}
                </h1>
                <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                  {coin.symbol}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleStar}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                isWatched
                  ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                  : "bg-white/5 border-white/10 text-text-secondary hover:text-white"
              }`}
            >
              <Star className="w-4 h-4" fill={isWatched ? "currentColor" : "none"} />
              {isWatched ? "Watchlisted" : "Watchlist"}
            </button>
            <Link
              href={`/compare?a=${coin.id}&b=ethereum`}
              className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-cyan/10 hover:border-accent-cyan/30 hover:text-accent-cyan transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" /> Compare
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
          <div className="space-y-8">
            <div className="glass-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className={`px-4 py-3 rounded-xl ${priceFlash}`}>
                  <div className="text-3xl font-black">
                    {formatPrice(currentPrice)}
                  </div>
                  <div
                    className={`text-sm font-black mt-1 ${
                      isPositive24h ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isPositive24h ? (
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 inline mr-1" />
                    )}
                    {formatPercent(currentChange)} (24h)
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.value}
                      onClick={() => setDays(tf.value)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        days === tf.value
                          ? "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
                          : "text-text-secondary hover:text-white border border-transparent"
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
              <div
                ref={chartRef}
                className="w-full rounded-xl overflow-hidden"
                style={{ height: 420 }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "7d Change",
                  value: formatPercent(coin.price_change_percentage_7d),
                  color:
                    (coin.price_change_percentage_7d ?? 0) >= 0
                      ? "text-emerald-400"
                      : "text-red-400",
                },
                {
                  label: "30d Change",
                  value: formatPercent(coin.price_change_percentage_30d),
                  color:
                    (coin.price_change_percentage_30d ?? 0) >= 0
                      ? "text-emerald-400"
                      : "text-red-400",
                },
                {
                  label: "ATH",
                  value: formatPrice(coin.ath),
                  color: "text-white",
                },
                {
                  label: "ATL",
                  value: formatPrice(coin.atl),
                  color: "text-white",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="glass-card p-5 text-center hover:bg-white/[0.04] transition-all"
                >
                  <div className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-2">
                    {stat.label}
                  </div>
                  <div className={`text-lg font-black ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-card">
              <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan">
                Market Stats
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                    <BarChart3 className="w-3 h-3" /> Market Cap
                  </span>
                  <span className="text-sm font-black">
                    {formatCurrency(coin.market_cap)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Volume (24h)
                  </span>
                  <span className="text-sm font-black">
                    {formatCurrency(coin.total_volume)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Circulating Supply
                  </span>
                  <span className="text-sm font-black">
                    {formatNumber(coin.circulating_supply)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Max Supply
                  </span>
                  <span className="text-sm font-black">
                    {coin.max_supply ? formatNumber(coin.max_supply) : "∞"}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-5 flex items-center justify-between">
                  <span className="text-xs font-bold text-text-secondary">
                    ATH Change
                  </span>
                  <div className="text-right">
                    <div className="text-sm font-black text-red-400">
                      {formatPercent(coin.ath_change_percentage)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
