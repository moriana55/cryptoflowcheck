"use client";

import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { Calendar, Clock, AlertTriangle, TrendingUp, Landmark, Cpu, Mic, Filter } from "lucide-react";

interface CryptoEvent {
  id: string;
  title: string;
  date: string;
  category: "Macro" | "Token Unlock" | "Protocol" | "Regulatory" | "Conference";
  impact: "High" | "Medium" | "Low";
  description: string;
}

const EVENTS: CryptoEvent[] = [
  {
    id: "eth-pectra",
    title: "Ethereum Pectra Upgrade",
    date: "2026-05-22",
    category: "Protocol",
    impact: "High",
    description: "Major Ethereum network upgrade introducing EOF, blob throughput increase, and validator ceiling raise to 2,048 ETH.",
  },
  {
    id: "arbitrum-stylus",
    title: "Arbitrum Stylus Mainnet Launch",
    date: "2026-05-28",
    category: "Protocol",
    impact: "Medium",
    description: "Arbitrum enables smart contracts in Rust, C, and C++ alongside EVM, potentially boosting developer adoption.",
  },
  {
    id: "fed-beige",
    title: "Fed Beige Book Release",
    date: "2026-05-28",
    category: "Macro",
    impact: "Medium",
    description: "Summary of economic conditions across Federal Reserve districts. Often hints at upcoming policy shifts.",
  },
  {
    id: "apt-unlock",
    title: "Aptos (APT) Token Unlock",
    date: "2026-06-01",
    category: "Token Unlock",
    impact: "High",
    description: "Large token unlock event releasing approximately $120M worth of APT into circulation. Watch for sell pressure.",
  },
  {
    id: "us-ism",
    title: "US ISM Services PMI",
    date: "2026-06-03",
    category: "Macro",
    impact: "Medium",
    description: "Key indicator of US services sector health. Strong data may delay rate cuts, impacting risk assets.",
  },
  {
    id: "us-cpi",
    title: "US CPI Data (May)",
    date: "2026-06-10",
    category: "Macro",
    impact: "High",
    description: "Consumer Price Index for May 2026. Critical inflation metric that directly influences Fed policy expectations.",
  },
  {
    id: "fomc",
    title: "FOMC Rate Decision",
    date: "2026-06-17",
    category: "Macro",
    impact: "High",
    description: "Federal Reserve interest rate decision. Markets pricing in potential pause or 25bp cut depending on inflation trajectory.",
  },
  {
    id: "sui-unlock",
    title: "Sui (SUI) Token Unlock",
    date: "2026-06-18",
    category: "Token Unlock",
    impact: "Medium",
    description: "Cliff unlock releasing team and investor allocations. Estimated $85M worth of tokens entering circulating supply.",
  },
  {
    id: "xrp-sec",
    title: "SEC XRP ETF Decision Deadline",
    date: "2026-06-30",
    category: "Regulatory",
    impact: "High",
    description: "Final deadline for SEC decision on spot XRP ETF applications. Approval could trigger significant altcoin rally.",
  },
  {
    id: "q2-gdp",
    title: "US Q2 GDP First Estimate",
    date: "2026-07-01",
    category: "Macro",
    impact: "Medium",
    description: "First reading of Q2 2026 GDP growth. Recession fears or strong growth both impact crypto risk appetite.",
  },
  {
    id: "btc-nashville",
    title: "Bitcoin Nashville Conference",
    date: "2026-07-15",
    category: "Conference",
    impact: "Low",
    description: "Annual Bitcoin maximalist conference. High-profile speakers often generate short-term market narratives.",
  },
  {
    id: "eth-bloom",
    title: "Ethereum Blobs Hardfork",
    date: "2026-08-05",
    category: "Protocol",
    impact: "Medium",
    description: "Planned increase in blob count per block from 6 to 9, reducing L2 transaction costs by an estimated 30%.",
  },
];

const CATEGORIES = ["All", "Macro", "Token Unlock", "Protocol", "Regulatory", "Conference"] as const;

function getCategoryIcon(cat: CryptoEvent["category"]) {
  switch (cat) {
    case "Macro": return Landmark;
    case "Token Unlock": return TrendingUp;
    case "Protocol": return Cpu;
    case "Regulatory": return AlertTriangle;
    case "Conference": return Mic;
    default: return Calendar;
  }
}

function getCategoryColor(cat: CryptoEvent["category"]) {
  switch (cat) {
    case "Macro": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    case "Token Unlock": return "text-accent-purple bg-accent-purple/10 border-accent-purple/20";
    case "Protocol": return "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20";
    case "Regulatory": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "Conference": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
  }
}

function getImpactColor(impact: CryptoEvent["impact"]) {
  switch (impact) {
    case "High": return "text-red-400 border-red-400/30 bg-red-400/10";
    case "Medium": return "text-amber-400 border-amber-400/30 bg-amber-400/10";
    case "Low": return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
  }
}

function getCountdown(targetDate: string) {
  const now = new Date();
  const target = new Date(targetDate + "T00:00:00");
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "Today";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return EVENTS;
    return EVENTS.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  return (
    <div className="min-h-screen selection:bg-accent-cyan/30 bg-bg-dark">
      <PriceTicker />
      <SiteHeader />

      <main className="container mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Economic <span className="text-gradient">Calendar</span>
          </h1>
          <p className="text-text-secondary text-sm max-w-lg">
            Track upcoming macro events, token unlocks, protocol upgrades, and regulatory deadlines that move the crypto market.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-gray-500 shrink-0">
            <Filter className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase">Filter:</span>
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
                activeCategory === cat
                  ? "border-accent-cyan text-accent-cyan bg-accent-cyan/10"
                  : "border-white/5 bg-white/5 text-gray-500 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/5 md:-translate-x-px" />

          <div className="space-y-8">
            {filtered.map((event, i) => {
              const Icon = getCategoryIcon(event.category);
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={event.id}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 ${
                    isLeft ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent-cyan rounded-full border-2 border-bg-dark md:-translate-x-1.5 z-10 mt-6 md:mt-0" />

                  {/* Card */}
                  <div
                    className={`ml-10 md:ml-0 md:w-[calc(50%-2rem)] ${
                      isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                    }`}
                  >
                    <div className="glass-card hover:bg-white/[0.04] transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${getCategoryColor(event.category)}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold">{event.title}</div>
                            <div className="text-[10px] font-black text-text-secondary uppercase tracking-wider mt-0.5">
                              {event.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getImpactColor(event.impact)}`}>
                            {event.impact} Impact
                          </span>
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getCategoryColor(event.category)}`}>
                            {event.category}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent-cyan">
                        <Clock className="w-3 h-3" />
                        {getCountdown(event.date)} remaining
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
