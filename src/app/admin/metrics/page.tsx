"use client";

import { useEffect, useState } from "react";
import { isAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { Activity, Brain, Eye, FileText, Star, Users } from "lucide-react";

interface Metrics {
  generatedAt: string;
  today: { date: string; dauProxy: number; aiQueries: number; watchToggles: number };
  last7Days: { date: string; dauProxy: number; aiQueries: number }[];
  content: { totalBlogPosts: number; latestPostDate: string | null };
  subscriptions: { total: number; activePro: number };
}

export default function AdminMetricsPage() {
  const router = useRouter();
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/admin/login");
      return;
    }
    fetch("/api/admin/metrics")
      .then((r) => {
        if (!r.ok) throw new Error("Yetkisiz veya veri alınamadı");
        return r.json();
      })
      .then((d: Metrics) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const cards = data
    ? [
        { label: "DAU (proxy, bugün)", value: data.today.dauProxy, icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10" },
        { label: "AI Sorgu (bugün)", value: data.today.aiQueries, icon: Brain, color: "text-purple-400", bg: "bg-purple-400/10" },
        { label: "Watchlist İşlemi", value: data.today.watchToggles, icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
        { label: "Toplam Blog", value: data.content.totalBlogPosts, icon: FileText, color: "text-emerald-400", bg: "bg-emerald-400/10" },
        { label: "Aktif Pro Abone", value: data.subscriptions.activePro, icon: Activity, color: "text-pink-400", bg: "bg-pink-400/10" },
        { label: "Toplam Abone Kaydı", value: data.subscriptions.total, icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
      ]
    : [];

  const maxDau = data ? Math.max(1, ...data.last7Days.map((d) => d.dauProxy)) : 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Metrikler</h1>
        <p className="text-sm text-gray-500 mt-1">Salt okunur kullanım istatistikleri</p>
      </div>

      {loading && (
        <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest animate-pulse">
          Yükleniyor...
        </div>
      )}
      {error && (
        <div className="text-[11px] font-black text-red-400 uppercase tracking-widest">{error}</div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cards.map((c, i) => (
              <div key={i} className="bg-[#111118] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                    <c.icon size={20} className={c.color} />
                  </div>
                </div>
                <p className="text-[28px] font-black text-white">{c.value}</p>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">
                  {c.label}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
            <h3 className="text-[13px] font-black text-white uppercase tracking-widest mb-5">
              Son 7 Gün — DAU (proxy)
            </h3>
            <div className="flex items-end gap-3 h-40">
              {data.last7Days.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-cyan-400/30 border-t-2 border-cyan-400 rounded-t-md"
                    style={{ height: `${(d.dauProxy / maxDau) * 100}%`, minHeight: "2px" }}
                    title={`${d.dauProxy} DAU / ${d.aiQueries} AI`}
                  />
                  <span className="text-[8px] font-bold text-gray-600">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-gray-600 font-bold">
            Üretildi: {new Date(data.generatedAt).toLocaleString()} — Sayaçlar bellekte tutulur (örnek/proxy).
          </p>
        </>
      )}
    </div>
  );
}
