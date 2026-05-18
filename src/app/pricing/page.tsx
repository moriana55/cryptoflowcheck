"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteStructure";
import { PriceTicker } from "@/components/PriceTicker";
import { Check, Zap, Crown, Sparkles } from "lucide-react";
import Link from "next/link";

const FREE_FEATURES = [
  "3 AI queries per day",
  "Basic market data",
  "Top 40 coins tracking",
  "Fear & Greed index",
  "Exchange comparison",
];

const PRO_FEATURES = [
  "Unlimited AI analysis",
  "Whale alert notifications",
  "Portfolio tracking",
  "Priority data refresh",
  "Custom coin alerts",
  "Export reports (PDF/CSV)",
  "AI-generated daily briefs",
  "Early access to new features",
];

export default function PricingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  async function handleCheckout() {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <PriceTicker />
      <SiteHeader />
      <main className="container mx-auto px-6 py-12">
        {success && (
          <div className="mb-8 glass-card border-emerald-400/20 text-emerald-400 text-center py-4 font-black text-sm">
            Welcome to Pro! Your subscription is active.
          </div>
        )}
        {canceled && (
          <div className="mb-8 glass-card border-amber-400/20 text-amber-400 text-center py-4 font-black text-sm">
            Checkout canceled. No charges were made.
          </div>
        )}

        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Upgrade to <span className="text-gradient">Pro</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Unlock the full power of CryptoFlowCheck&apos;s AI intelligence engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="glass-card p-8 relative">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-black">Free</h2>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-black">$0</span>
              <span className="text-text-secondary text-sm font-bold"> / forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-gray-500 shrink-0" />
                  <span className="text-text-secondary font-bold">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/markets"
              className="w-full flex items-center justify-center py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-text-secondary hover:text-white transition-colors"
            >
              Current Plan
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="glass-card p-8 relative border-accent-cyan/30 bg-accent-cyan/[0.02]">
            <div className="absolute -top-3 right-6 px-3 py-1 bg-accent-cyan text-bg-dark text-[9px] font-black uppercase tracking-widest rounded-full">
              Popular
            </div>
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-accent-cyan" />
              <h2 className="text-xl font-black">Pro</h2>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-black text-accent-cyan">$9.99</span>
              <span className="text-text-secondary text-sm font-bold"> / month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-accent-cyan shrink-0" />
                  <span className="font-bold">{f}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-accent-cyan/30 transition-colors"
              />
              <button
                onClick={handleCheckout}
                disabled={loading || !email}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Redirecting..." : "Start Pro — $9.99/mo"}
              </button>
              <p className="text-[10px] text-text-secondary text-center font-bold">
                Cancel anytime. Powered by Stripe.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
