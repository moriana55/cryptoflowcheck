import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="h-20 flex items-center border-b border-white/5 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-bg-card border border-glass-border rounded-xl flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 20V14M8 20V10M12 20V12M16 20V6M20 20V16"/></svg>
          </div>
          <span className="font-black text-lg tracking-tight">
            CRYPTO<span className="text-gradient">FLOWCHECK</span>.COM
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {["Home", "Market Map", "Live Analytics", "Alerts"].map(item => (
            <Link key={item} href="#" className="text-text-secondary text-sm font-bold hover:text-white transition-colors relative group py-2">
              {item}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-accent-cyan to-accent-purple group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-accent-cyan text-[10px] font-black cursor-pointer bg-accent-cyan/10 px-2 py-1 rounded">EN</span>
            <span className="text-text-secondary text-[10px] font-black cursor-pointer hover:text-white px-2 py-1">TR</span>
          </div>
          <button className="px-6 py-2.5 bg-bg-card border border-white/10 rounded-xl text-xs font-bold hover:border-accent-cyan/50 hover:shadow-[0_0_20px_rgba(0,242,255,0.1)] transition-all">
            Account
          </button>
        </div>
      </div>
    </header>
  );
}

export function IntelligenceFeed() {
  const news = [
    {
      badge: "WHALE ACTIVITY ALERT",
      title: "Huge Inflow Detected: $500M USDT Moves to Binance",
      excerpt: "Our sensors detected a massive movement. Historically, this precedes a major market entry by high-net-worth entities.",
      type: "whale"
    },
    {
      badge: "HIGH ALPHA SIGNAL",
      title: "Ethereum Outflows Hit Yearly High",
      excerpt: "On-chain data suggests institutional accumulation is accelerating at these levels. Supply shock incoming.",
      type: "alpha"
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black tracking-tight">Latest <span className="text-gradient">Intelligence</span></h2>
      </div>

      <div className="space-y-6">
        {news.map((item, i) => (
          <article key={i} className="glass-card cursor-pointer group hover:-translate-y-1">
            <div className={`pulse-badge mb-4 ${item.type === "alpha" ? "!text-accent-cyan !border-accent-cyan !bg-accent-cyan/10" : ""}`}>
              <span className="pulse-dot"></span> {item.badge}
            </div>
            <h3 className="text-xl font-black mb-3 leading-tight">{item.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">{item.excerpt}</p>
            <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest group-hover:translate-x-2 transition-transform inline-block">
              Analyze Alpha →
            </span>
          </article>
        ))}
        
        <div className="p-8 border border-dashed border-white/5 rounded-3xl flex items-center justify-center text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] bg-white/[0.01] hover:bg-accent-cyan/[0.02] hover:border-accent-cyan/20 transition-all cursor-pointer">
          SPONSORED ANALYSIS - PARTNER OFFER
        </div>
      </div>
    </section>
  );
}
