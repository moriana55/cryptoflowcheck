"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCoinList, getCoinMap, getCustomCoins, addCustomCoin, removeCustomCoin, type CoinMeta } from "@/lib/coins";
import { isAdmin } from "@/lib/admin";
import { Trash2, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { findCoinsWithAI } from "@/lib/ai";

export default function AdminCoinsPage() {
  const router = useRouter();
  const [coins, setCoins] = useState(getCoinList());
  const [custom, setCustom] = useState<Record<string, CoinMeta>>({});
  const [adding, setAdding] = useState(false);
  const [aiCoins, setAiCoins] = useState<Array<{ id: string; symbol: string; name: string; pair: string; category: string; reason: string }>>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    id: "",
    symbol: "",
    name: "",
    pair: "",
    maxSupply: "",
    circulatingSupply: "",
    category: "LAYER 1",
  });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = "/admin/login";
    } else {
      setCoins(getCoinList());
      setCustom(getCustomCoins());
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest animate-pulse">Checking credentials...</div>
      </div>
    );
  }

  function handleAdd() {
    if (!form.id || !form.symbol || !form.name || !form.pair) return;
    addCustomCoin(form.id, {
      symbol: form.symbol,
      name: form.name,
      pair: form.pair,
      maxSupply: form.maxSupply ? Number(form.maxSupply) : null,
      circulatingSupply: form.circulatingSupply ? Number(form.circulatingSupply) : null,
      category: form.category,
    });
    setCoins(getCoinList());
    setCustom(getCustomCoins());
    setAdding(false);
    setForm({ id: "", symbol: "", name: "", pair: "", maxSupply: "", circulatingSupply: "", category: "LAYER 1" });
  }

  function handleRemove(id: string) {
    if (!confirm("Remove this coin?")) return;
    removeCustomCoin(id);
    setCoins(getCoinList());
    setCustom(getCustomCoins());
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="h-16 border-b border-white/5 flex items-center justify-between container mx-auto px-6">
        <Link href="/admin" className="font-black text-sm tracking-tight">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setAiLoading(true);
              try {
                const coins = await findCoinsWithAI();
                const existingIds = new Set(Object.keys(getCoinMap()).map((id) => id.toLowerCase()));
                const filtered = coins.filter((c) => !existingIds.has(c.id.toLowerCase()));
                setAiCoins(filtered);
                if (filtered.length === 0) {
                  alert("AI found coins but all are already in your database.");
                }
              } catch (err: any) {
                console.error("AI Scout error:", err);
                alert("AI Scout failed: " + (err?.message || "Unknown error. Check console (F12) for details."));
              } finally {
                setAiLoading(false);
              }
            }}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-accent-purple text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" /> {aiLoading ? "Scouting..." : "AI Scout"}
          </button>
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-cyan text-bg-dark rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> Add Coin
          </button>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        {adding && (
          <div className="glass-card max-w-2xl mx-auto mb-10 space-y-4">
            <h2 className="text-lg font-black">Add Custom Coin</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="ID (e.g. bitcoin)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
              />
              <input
                placeholder="Symbol (e.g. btc)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              />
              <input
                placeholder="Name (e.g. Bitcoin)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                placeholder="Pair (e.g. BTCUSDT)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                value={form.pair}
                onChange={(e) => setForm({ ...form, pair: e.target.value })}
              />
              <input
                placeholder="Max Supply (optional)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                value={form.maxSupply}
                onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
              />
              <input
                placeholder="Circulating Supply (optional)"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none"
                value={form.circulatingSupply}
                onChange={(e) => setForm({ ...form, circulatingSupply: e.target.value })}
              />
              <select
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none col-span-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {["LAYER 1", "DEFI", "MEMES", "AI COINS", "EXCHANGE", "GAMING"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-accent-cyan text-bg-dark font-black text-xs uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
              >
                Save
              </button>
              <button
                onClick={() => setAdding(false)}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-text-secondary font-black text-xs uppercase tracking-widest rounded-xl hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {aiCoins.length > 0 && (
          <div className="glass-card border-accent-purple/20 mb-10">
            <div className="text-sm font-black mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-purple" /> AI Recommendations
            </div>
            <div className="space-y-3">
              {aiCoins.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <span className="text-xs font-black text-accent-cyan uppercase">{c.symbol}</span>
                    <span className="text-sm font-bold ml-2">{c.name}</span>
                    <span className="text-[10px] font-bold text-text-secondary ml-2">{c.pair}</span>
                    <p className="text-[10px] text-text-secondary mt-1">{c.reason}</p>
                  </div>
                  <button
                    onClick={() => {
                      addCustomCoin(c.id, {
                        symbol: c.symbol,
                        name: c.name,
                        pair: c.pair,
                        maxSupply: null,
                        circulatingSupply: null,
                        category: c.category,
                      });
                      setCoins(getCoinList());
                      setCustom(getCustomCoins());
                      setAiCoins((prev) => prev.filter((x) => x.id !== c.id));
                    }}
                    className="px-3 py-1.5 bg-accent-cyan/10 border border-accent-cyan/30 rounded-lg text-[10px] font-black text-accent-cyan uppercase tracking-wider hover:bg-accent-cyan/20 transition-all"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {coins.map((c) => {
            const isCustom = !!custom[c.id];
            return (
              <div key={c.id} className="glass-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-accent-cyan uppercase">{c.symbol}</span>
                  <span className="text-sm font-bold">{c.name}</span>
                  <span className="text-[10px] font-bold text-text-secondary">{c.pair}</span>
                  {isCustom && (
                    <span className="text-[9px] font-black text-accent-purple uppercase bg-accent-purple/10 px-2 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </div>
                {isCustom && (
                  <button onClick={() => handleRemove(c.id)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
