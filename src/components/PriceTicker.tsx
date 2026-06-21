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
  if (!Number.isFinite(price)) return "—";
  if (price >= 1000)
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (price >= 1)
    return "$" + price.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (price >= 0.001) return "$" + price.toFixed(4);
  if (price <= 0) return "$0";
  // Sub-cent memecoins (e.g. 0.00000001): avoid scientific notation by showing
  // enough decimals to surface the first significant digits.
  return "$" + price.toFixed(10).replace(/0+$/, "");
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
    <div className="w-full bg-surface-container-lowest py-2 border-b border-outline-variant/30 overflow-hidden relative z-[60]">
      <div className="relative">
        <div className="flex gap-12 animate-[scroll_40s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap px-gutter">
          {doubled.map((item, i) => (
            <div
              key={i}
              className={`inline-flex items-center gap-2 font-mono text-label-md shrink-0 px-2 py-0.5 rounded ${
                item.direction === "up"
                  ? "flash-up"
                  : item.direction === "down"
                  ? "flash-down"
                  : ""
              }`}
            >
              <span className="text-on-surface-variant">{item.name}</span>
              <span className="text-primary font-bold">{item.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
