"use client";
import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, X, Star } from "lucide-react";
import { EXCHANGES, type Exchange } from "@/data/exchanges";

interface ExchangeSelectorProps {
  selected: Exchange;
  onSelect: (exchange: Exchange) => void;
  accent: "cyan" | "purple";
  label: string;
}

export function ExchangeSelector({ selected, onSelect, accent, label }: ExchangeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const results = query.trim()
    ? EXCHANGES.filter(
        (e) =>
          e.name.toLowerCase().includes(query.toLowerCase()) ||
          e.id.toLowerCase().includes(query.toLowerCase())
      )
    : EXCHANGES;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const accentColor = accent === "cyan" ? "accent-cyan" : "accent-purple";
  const accentBorder = accent === "cyan" ? "border-accent-cyan" : "border-accent-purple";
  const accentShadow = accent === "cyan"
    ? "shadow-[0_0_30px_rgba(0,242,255,0.15)]"
    : "shadow-[0_0_30px_rgba(157,0,255,0.15)]";
  const accentBg = accent === "cyan" ? "bg-accent-cyan/10" : "bg-accent-purple/10";

  return (
    <div ref={ref} className="relative flex-1 min-w-0">
      <div className={`text-[9px] font-black uppercase tracking-[0.3em] text-${accentColor} mb-2`}>
        {label}
      </div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all bg-bg-card ${
          open ? `${accentBorder} ${accentShadow}` : "border-white/10 hover:border-white/20"
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${accentBg} text-white border border-white/10`}>
          {selected.name.slice(0, 2)}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-black truncate">{selected.name}</div>
          <div className="text-[10px] text-text-secondary font-bold uppercase">
            Rating {selected.overallRating}/10
          </div>
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
                placeholder="Search exchanges..."
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
            {results.length === 0 ? (
              <div className="p-6 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                No results
              </div>
            ) : (
              results.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    onSelect(ex);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left ${
                    selected.id === ex.id ? accentBg : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 bg-white/5 text-white border border-white/10">
                    {ex.name.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold">{ex.name}</span>
                    <span className="text-[10px] text-text-secondary font-bold ml-2">{ex.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                    <span className="text-[10px] font-black">{ex.overallRating}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
