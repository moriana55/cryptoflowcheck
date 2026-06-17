interface VitalSignsProps {
  totalMarketCap: number | null;
  btcDominance: number | null;
  marketCapChange24h: number | null;
  avgChange: number | null;
  fearGreed: number | null;
}

export function VitalSigns({ totalMarketCap, btcDominance, marketCapChange24h, avgChange, fearGreed }: VitalSignsProps) {
  const signs = [
    {
      label: "TOTAL MARKET CAP",
      value: totalMarketCap != null ? `$${(totalMarketCap / 1e12).toFixed(2)}T` : "—",
      sub: marketCapChange24h != null
        ? `${marketCapChange24h >= 0 ? "+" : ""}${marketCapChange24h.toFixed(2)}% (24h)`
        : null,
      subColor: marketCapChange24h != null && marketCapChange24h >= 0 ? "text-primary" : "text-error",
      borderColor: "border-primary-container",
    },
    {
      label: "BTC DOMINANCE",
      value: btcDominance != null ? `${btcDominance.toFixed(1)}%` : "—",
      sub: null,
      subColor: "",
      borderColor: "border-secondary",
      barValue: btcDominance,
    },
    {
      label: "AVG 24H CHANGE",
      value: avgChange != null ? `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%` : "—",
      sub: avgChange != null ? `Market Trend: ${avgChange >= 0 ? "Bullish" : "Bearish"}` : null,
      subColor: "text-on-surface-variant",
      borderColor: avgChange != null && avgChange >= 0 ? "border-primary" : "border-error",
    },
    {
      label: "FEAR & GREED",
      value: fearGreed != null ? `${fearGreed}/100` : "—",
      sub: fearGreed != null ? (fearGreed >= 75 ? "EXTREME GREED" : fearGreed >= 55 ? "GREED" : fearGreed >= 45 ? "NEUTRAL" : fearGreed >= 25 ? "FEAR" : "EXTREME FEAR") : null,
      subColor: "text-tertiary",
      borderColor: "border-tertiary",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-stack-md mb-stack-lg">
      {signs.map((sign, i) => (
        <div
          key={i}
          className={`glass-panel p-stack-md rounded-xl border-l-4 ${sign.borderColor} shadow-lg`}
        >
          <p className="font-geist text-label-md text-on-surface-variant mb-2">{sign.label}</p>
          <h2 className={`font-geist text-headline-sm ${
            i === 0 ? "text-primary" : i === 1 ? "text-secondary" : i === 2 ? (avgChange != null && avgChange >= 0 ? "text-primary" : "text-error") : "text-tertiary"
          } mb-1`}>
            {sign.value}
          </h2>
          {sign.sub && (
            <p className={`font-mono text-sm ${sign.subColor} ${
              i === 2 ? "" : i === 0 ? "bg-error/10 inline-block px-1 rounded" : i === 3 ? "bg-tertiary/10 inline-block px-2 py-0.5 rounded font-geist text-xs font-bold" : ""
            }`}>
              {sign.sub}
            </p>
          )}
          {"barValue" in sign && sign.barValue != null && (
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden mt-3 relative">
              <div
                className="h-full bg-secondary glow-secondary absolute left-0 top-0 transition-all duration-1000"
                style={{ width: `${sign.barValue}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
