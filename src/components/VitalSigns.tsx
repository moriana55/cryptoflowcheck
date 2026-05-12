export function VitalSigns() {
  const signs = [
    { label: "NET FLOW VELOCITY", value: "+$124.5M", unit: "/s", highlight: "cyan" },
    { label: "WHALE INDEX", value: "84.2", unit: "%", highlight: "" },
    { label: "NETWORK HEAT", value: "STABLE", unit: "", highlight: "green" },
    { label: "ALPHA FLOW SIGNAL", value: "BULLISH", unit: "", highlight: "purple" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
      {signs.map((sign, i) => (
        <div key={i} className={`glass-card min-h-[120px] flex flex-col justify-between ${
          sign.highlight === "cyan" ? "border-accent-cyan/40 shadow-[0_0_30px_rgba(0,242,255,0.05)]" : 
          sign.highlight === "purple" ? "border-accent-purple/40 shadow-[0_0_30px_rgba(157,0,255,0.05)]" : ""
        }`}>
          <div className="text-[10px] font-black tracking-[0.15em] text-text-secondary uppercase">
            {sign.label}
          </div>
          <div className={`text-3xl font-black tracking-tight leading-none ${
            sign.highlight === "cyan" ? "text-gradient" : 
            sign.highlight === "green" ? "text-emerald-400" :
            sign.highlight === "purple" ? "text-accent-purple" : ""
          }`}>
            {sign.value}
            {sign.unit && <span className="text-xs text-text-secondary ml-1.5 font-bold uppercase">{sign.unit}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
