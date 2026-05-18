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
      value: totalMarketCap != null ? `$${(totalMarketCap / 1e12).toFixed(2)}` : "—",
      sub: marketCapChange24h != null
        ? `${marketCapChange24h >= 0 ? "+" : ""}${marketCapChange24h.toFixed(2)}% (24h)`
        : null,
      subColor: marketCapChange24h != null && marketCapChange24h >= 0 ? "text-emerald-400" : "text-red-400",
      unit: "T",
      highlight: "cyan" as const,
    },
    {
      label: "BTC DOMINANCE",
      value: btcDominance != null ? `${btcDominance.toFixed(1)}` : "—",
      sub: null,
      subColor: "",
      unit: "%",
      highlight: "purple" as const,
    },
    {
      label: "AVG 24H CHANGE",
      value: avgChange != null ? `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}` : "—",
      sub: null,
      subColor: "",
      unit: "%",
      highlight: avgChange != null && avgChange >= 0 ? "green" : "red" as const,
    },
    {
      label: "FEAR & GREED",
      value: fearGreed != null ? `${fearGreed}` : "—",
      sub: null,
      subColor: "",
      unit: "/100",
      highlight: fearGreed != null && fearGreed >= 50 ? "green" : "red" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
      {signs.map((sign, i) => (
        <div
          key={i}
          className={`glass-card min-h-[120px] flex flex-col justify-between ${
            sign.highlight === "cyan"
              ? "border-accent-cyan/40 shadow-[0_0_30px_rgba(0,242,255,0.05)]"
              : sign.highlight === "purple"
              ? "border-accent-purple/40 shadow-[0_0_30px_rgba(157,0,255,0.05)]"
              : ""
          }`}
        >
          <div className="text-[10px] font-black tracking-[0.15em] text-text-secondary uppercase">
            {sign.label}
          </div>
          <div>
            <div
              className={`text-3xl font-black tracking-tight leading-none ${
                sign.highlight === "cyan"
                  ? "text-gradient"
                  : sign.highlight === "green"
                  ? "text-emerald-400"
                  : sign.highlight === "red"
                  ? "text-red-400"
                  : sign.highlight === "purple"
                  ? "text-accent-purple"
                  : ""
              }`}
            >
              {sign.value}
              {sign.unit && (
                <span className="text-xs text-text-secondary ml-1.5 font-bold uppercase">
                  {sign.unit}
                </span>
              )}
            </div>
            {sign.sub && (
              <div className={`text-[10px] font-black mt-1 ${sign.subColor}`}>
                {sign.sub}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
