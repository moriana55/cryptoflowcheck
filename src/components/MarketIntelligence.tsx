"use client";

export function MarketHeatmap() {
  const cells = [
    { name: "BTC", level: "high" },
    { name: "ETH", level: "med" },
    { name: "SOL", level: "high" },
    { name: "PEPE", level: "low" },
    { name: "WIF", level: "high" },
    { name: "AVAX", level: "med" },
    { name: "DOGE", level: "low" },
    { name: "SHIB", level: "med" },
  ];

  return (
    <div className="glass-card">
      <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan">
        Flow Heatmap
      </div>
      <div className="grid grid-cols-4 gap-3">
        {cells.map((cell, i) => (
          <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black cursor-pointer transition-transform hover:scale-105 border ${
            cell.level === "high" ? "bg-emerald-400/15 border-emerald-400 text-emerald-400" :
            cell.level === "med" ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan" :
            "bg-red-500/10 border-red-500 text-red-500"
          }`}>
            {cell.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentimentGauge() {
  const value = 72;
  const rotation = (value / 100) * 180 - 90;

  return (
    <div className="glass-card text-center flex flex-col items-center">
      <div className="text-[10px] font-black tracking-widest text-text-secondary uppercase mb-6 pl-3 border-l-2 border-accent-cyan self-start">
        Fear & Greed Index
      </div>
      
      <div className="relative w-32 h-16 mt-4 overflow-hidden">
        <div className="absolute inset-0 border-[12px] border-white/5 rounded-t-full"></div>
        <div 
          className="absolute inset-0 border-[12px] border-accent-cyan rounded-t-full origin-bottom"
          style={{ clipPath: 'inset(0 0 0 0)', transform: `rotate(${rotation}deg)` }}
        ></div>
      </div>
      
      <div className="text-3xl font-black mt-4">{value}</div>
      <div className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest mt-1">Extreme Greed</div>
    </div>
  );
}
