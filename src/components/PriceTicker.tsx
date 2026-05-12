"use client";

const tickerData = [
  { name: "BTC", price: "$64,231", change: "+1.2%", up: true },
  { name: "ETH", price: "$3,450", change: "+0.8%", up: true },
  { name: "SOL", price: "$145", change: "-2.1%", up: false },
  { name: "PEPE", price: "$0.000008", change: "+12.5%", up: true },
  { name: "WIF", price: "$3.24", change: "+5.8%", up: true },
  { name: "DOGE", price: "$0.15", change: "-1.2%", up: false },
  { name: "SHIB", price: "$0.000024", change: "+3.2%", up: true },
  { name: "LINK", price: "$18.4", change: "+4.5%", up: true },
];

export function PriceTicker() {
  return (
    <div className="w-full bg-[#0C111D] border-b border-white/5 py-2.5 overflow-hidden">
      <div className="container mx-auto px-6 relative">
        <div className="animate-marquee hover:[animation-play-state:paused]">
          {[...tickerData, ...tickerData].map((item, i) => (
            <div key={i} className="ticker-item mr-16">
              <span className="text-text-secondary">{item.name}</span>
              <span>{item.price}</span>
              <span className={item.up ? "up" : "down"}>{item.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
