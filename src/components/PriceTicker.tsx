"use client";

import { useMemo } from "react";
import { useLivePrices } from "@/lib/useLivePrices";

const PAIRS = [
  { symbol: "BTCUSDT", name: "BTC" },
  { symbol: "ETHUSDT", name: "ETH" },
  { symbol: "SOLUSDT", name: "SOL" },
  { symbol: "BNBUSDT", name: "BNB" },
  { symbol: "XRPUSDT", name: "XRP" },
  { symbol: "DOGEUSDT", name: "DOGE" },
  { symbol: "ADAUSDT", name: "ADA" },
  { symbol: "AVAXUSDT", name: "AVAX" },
  { symbol: "LINKUSDT", name: "LINK" },
  { symbol: "SUIUSDT", name: "SUI" },
  { symbol: "PEPEUSDT", name: "PEPE" },
  { symbol: "SHIBUSDT", name: "SHIB" },
];

function formatPrice(price: number): string {
  if (price >= 1000)
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1)
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 0.001) return "$" + price.toFixed(4);
  return "$" + price.toPrecision(2);
}

export function PriceTicker() {
  const live = useLivePrices();

  const items = useMemo(() => {
    return PAIRS.map((p) => {
      const data = live[p.symbol];
      if (!data)
        return {
          name: p.name,
          price: "—",
          change: "—",
          up: true,
          direction: "neutral" as const,
        };
      const pct = data.change24h;
      return {
        name: p.name,
        price: formatPrice(data.price),
        change: (pct >= 0 ? "+" : "") + pct.toFixed(1) + "%",
        up: pct >= 0,
        direction: data.direction,
      };
    });
  }, [live]);

  const doubled = [...items, ...items];

  return (
    <div className="w-full bg-[#0C111D] border-b border-white/5 py-2.5 overflow-hidden">
      <div className="relative">
        <div className="flex gap-10 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap">
          {doubled.map((item, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-2 text-xs font-bold shrink-0 px-2 py-0.5 rounded ${
                item.direction === "up"
                  ? "flash-up"
                  : item.direction === "down"
                  ? "flash-down"
                  : ""
              }`}
            >
              <span className="text-text-secondary">{item.name}</span>
              <span className="text-white">{item.price}</span>
              <span className={item.up ? "text-emerald-400" : "text-red-400"}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
