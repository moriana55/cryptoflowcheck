"use client";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { CoinLogo } from "@/components/CoinLogo";
import { fetchBinanceCoins } from "@/lib/binance";
import { getCoinList } from "@/lib/coins";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  market_cap_rank?: number;
}

interface CoinSelectorProps {
  selected: Coin | null;
  onSelect: (coin: Coin) => void;
  accent: "cyan" | "purple";
  label: string;
}

export function CoinSelector({ selected, onSelect, accent, label }: CoinSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Coin[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const list = getCoinList();
    fetchBinanceCoins(list)
      .then((data) => {
        setAllCoins(
          data.map((c) => ({
            id: c.id,
            symbol: c.symbol,
            name: c.name,
            image: c.image ?? undefined,
            market_cap_rank: c.market_cap_rank,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults(allCoins);
      return;
    }
    setResults(
      allCoins.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.symbol.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
      )
    );
  }, [query, allCoins]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const accentColor = accent === "cyan" ? "accent-cyan" : "accent-purple";
  const accentBg = accent === "cyan" ? "accent-cyan/10" : "accent-purple/10";

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <div className={`text-[9px] font-black uppercase tracking-[0.3em] text-${accentColor} mb-2`}>
        {label}
      </div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all bg-bg-card ${
          open ? `border-${accentColor} shadow-[0_0_30px_rgba(${accent === "cyan" ? "34,211,238" : "165,180,252"},0.15)]` : "border-white/10 hover:border-white/20"
        }`}
      >
        {selected?.symbol && <CoinLogo symbol={selected.symbol} size={28} />}
        <div className="flex-1 text-left min-w-0">
          {selected ? (
            <>
              <div className="text-sm font-black truncate">{selected.name}</div>
              <div className="text-[10px] text-text-secondary font-bold uppercase">{selected.symbol}</div>
            </>
          ) : (
            <div className="text-sm text-text-secondary font-bold">Select coin...</div>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0C111D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coins..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold outline-none focus:border-white/20"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-text-secondary" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest animate-pulse">
                Loading...
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                No results
              </div>
            ) : (
              results.map((coin) => (
                <button
                  key={coin.id}
                  onClick={() => {
                    onSelect(coin);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                    selected?.id === coin.id ? `bg-${accentBg}` : ""
                  }`}
                >
                  <CoinLogo symbol={coin.symbol} size={24} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold truncate">{coin.name}</span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase ml-2">{coin.symbol}</span>
                  </div>
                  {coin.market_cap_rank && (
                    <span className="text-[9px] font-black text-text-secondary">#{coin.market_cap_rank}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
