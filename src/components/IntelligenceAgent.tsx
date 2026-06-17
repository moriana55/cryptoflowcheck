"use client";

import { useState } from "react";
import { MessageSquare, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { getCoinMap } from "@/lib/coins";
import { getLivePrice } from "@/lib/livePrices";
import { EXCHANGES } from "@/data/exchanges";
import { fetchFearGreed } from "@/lib/binance";

function renderMessage(text: string) {
  const parts = text.split(/(\*\*.+?\*\*|\[.+?\]\(.+?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      return (
        <Link key={i} href={linkMatch[2]} className="text-primary hover:underline">
          {linkMatch[1]}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function CFCAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; text: string }[]
  >([
    {
      role: "ai",
      text: "Greeting Architect. I am CFC-AI. Ask me about any coin's live price, market stats, exchange ratings, or the Fear & Greed Index.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  async function generateResponse(userInput: string): Promise<string> {
    const lower = userInput.toLowerCase().trim();
    const coinMap = getCoinMap();

    if (/^(hello|hi|hey|merhaba|selam)/.test(lower)) {
      return "Greeting Architect. I am CFC-AI. Ask me about any coin's live price, market stats, exchange ratings, or the Fear & Greed Index.";
    }

    if (lower.includes("fear") || lower.includes("greed")) {
      try {
        const data = await fetchFearGreed();
        if ("error" in data) throw new Error("API error");
        if (data.value != null) {
          return `Current Fear & Greed Index is **${data.value}** — classified as **${data.classification}**. ${
            data.value >= 75
              ? "Extreme greed often signals a potential correction."
              : data.value >= 55
              ? "Greed indicates bullish momentum but be cautious."
              : data.value >= 45
              ? "Neutral sentiment — market is indecisive."
              : data.value >= 25
              ? "Fear in the market — possible accumulation zone."
              : "Extreme fear — historically good entry points for long-term holders."
          }`;
        }
      } catch {
        return "I couldn't fetch the Fear & Greed Index right now. Try again later.";
      }
    }

    const exchMatch = lower.match(/compare\s+(\w+)\s+(?:and|vs|with)?\s*(\w+)?/);
    if (exchMatch) {
      const e1 = EXCHANGES.find(
        (e) => e.id === exchMatch[1] || e.name.toLowerCase() === exchMatch[1]
      );
      const e2 = EXCHANGES.find(
        (e) => e.id === (exchMatch[2] || "coinbase") || e.name.toLowerCase() === (exchMatch[2] || "coinbase")
      );
      if (e1 && e2) {
        const winner = e1.overallRating >= e2.overallRating ? e1 : e2;
        return `**${e1.name}** (${e1.overallRating}/10) vs **${e2.name}** (${e2.overallRating}/10).\n\nWinner: **${winner.name}**\n- ${e1.name} Fees: ${e1.spotFee} | Security: ${e1.securityScore}/10\n- ${e2.name} Fees: ${e2.spotFee} | Security: ${e2.securityScore}/10\n\n[View full comparison](/compare/exchanges?a=${e1.id}&b=${e2.id})`;
      }
    }

    if (/best|top\s+\d?|ranking/.test(lower) && /exchange|borsa/.test(lower)) {
      const top = [...EXCHANGES]
        .sort((a, b) => b.overallRating - a.overallRating)
        .slice(0, 3);
      return `Top 3 exchanges by overall rating:\n\n1. **${top[0].name}** — ${top[0].overallRating}/10 (${top[0].spotFee} spot fee)\n2. **${top[1].name}** — ${top[1].overallRating}/10 (${top[1].spotFee} spot fee)\n3. **${top[2].name}** — ${top[2].overallRating}/10 (${top[2].spotFee} spot fee)`;
    }

    for (const [id, meta] of Object.entries(coinMap)) {
      if (
        lower.includes(id) ||
        lower.includes(meta.symbol) ||
        lower.includes(meta.name.toLowerCase())
      ) {
        const live = getLivePrice(meta.pair);
        if (live) {
          const changeEmoji = live.change24h >= 0 ? "↑" : "↓";
          return `${changeEmoji} **${meta.name}** (${meta.symbol.toUpperCase()})\n\nPrice: **$${live.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: live.price >= 1 ? 2 : 4 })}**\n24h Change: **${live.change24h >= 0 ? "+" : ""}${live.change24h.toFixed(2)}%**\n\n[View Chart](/coin/${id})`;
        }
        return `${meta.name} data is currently syncing. Try again in a few seconds.`;
      }
    }

    if (/market|piyasa|overview/.test(lower)) {
      return "For the full market overview, check out the [Markets](/markets) page. You can also view the [Heatmap](/heatmap) for a visual snapshot of 24h performance across all tracked coins.";
    }

    return "I'm analyzing your query...\n\nHere is what I can do:\n• **Coin prices**: Ask 'Bitcoin price' or 'What is ETH doing?'\n• **Fear & Greed**: Ask 'Fear and greed index'\n• **Exchange compare**: Ask 'Compare Binance and Coinbase'\n• **Top exchanges**: Ask 'Best exchanges'\n• **Market view**: Say 'Show me the market'";
  }

  const handleSend = async () => {
    if (!input.trim() || thinking) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setThinking(true);

    try {
      const response = await generateResponse(userText);
      setMessages((prev) => [...prev, { role: "ai", text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "My neural circuits experienced a temporary glitch. Please try again.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[200]">
      {isOpen ? (
        <div className="w-[380px] h-[500px] glass-panel !rounded-2xl shadow-[0_20px_80px_rgba(142,209,223,0.1)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="p-5 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="font-geist text-label-md font-bold uppercase tracking-widest text-on-surface">
                  CFC Intelligence
                </h4>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  <span className="text-[8px] font-bold text-primary uppercase">
                    Agent Active
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-grow overflow-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-xl text-[11px] font-medium leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-primary text-on-primary font-bold"
                      : "bg-surface-container-high text-on-surface border border-outline-variant/20"
                  }`}
                >
                  {renderMessage(m.text)}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-xl text-[11px] font-medium leading-relaxed bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                  <span className="animate-pulse">Analyzing market data...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Intelligence..."
                className="w-full bg-surface-container border border-outline-variant/30 rounded-xl py-3 pl-5 pr-14 text-xs text-on-surface outline-none focus:border-primary/50 placeholder:text-on-surface-variant/40"
              />
              <button
                onClick={handleSend}
                disabled={thinking}
                className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(142,209,223,0.3)] hover:scale-105 active:scale-95 transition-all group relative"
        >
          <MessageSquare className="w-6 h-6 relative z-10" />
        </button>
      )}
    </div>
  );
}
