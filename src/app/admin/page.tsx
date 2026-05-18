"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCoinList } from "@/lib/coins";
import { FileText, Coins, Zap, Settings, TrendingUp, Clock } from "lucide-react";

interface BlogPost {
  id: string; title: string; date: string; tags: string[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ coins: 0, blogs: 0, latestBlog: "" });
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((posts: BlogPost[]) => {
        setStats({
          coins: getCoinList().length,
          blogs: posts.length,
          latestBlog: posts[0]?.date || "-",
        });
        setRecentPosts(posts.slice(0, 5));
      })
      .catch(console.error);
  }, []);

  const cards = [
    { label: "Toplam Blog", value: stats.blogs, icon: FileText, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Takip Edilen Coin", value: stats.coins, icon: Coins, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Son Blog Tarihi", value: stats.latestBlog, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  const quickLinks = [
    { href: "/admin/blog", label: "Blog Yönetimi", desc: "Yazı ekle, düzenle, sil", icon: FileText, color: "text-cyan-400" },
    { href: "/admin/coins", label: "Coin Yönetimi", desc: "Coin ekle/çıkar", icon: Coins, color: "text-purple-400" },
    { href: "/admin/cron", label: "Cron & AI", desc: "Manuel blog üret, cron tetikle", icon: Zap, color: "text-amber-400" },
    { href: "/admin/ayarlar", label: "Ayarlar", desc: "Site ayarları", icon: Settings, color: "text-gray-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">CryptoFlowCheck yönetim paneli</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#111118] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg}`}>
                <c.icon size={20} className={c.color} />
              </div>
            </div>
            <p className="text-[28px] font-black text-white">{c.value}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="bg-[#111118] border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:border-white/10 transition-colors"
          >
            <q.icon size={28} className={q.color} />
            <div>
              <p className="text-[14px] font-black text-white">{q.label}</p>
              <p className="text-[11px] text-gray-500 font-bold">{q.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {recentPosts.length > 0 && (
        <div className="bg-[#111118] border border-white/5 rounded-2xl p-6">
          <h3 className="text-[13px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-400" /> Son Yazılar
          </h3>
          <div className="space-y-3">
            {recentPosts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <p className="text-[13px] font-bold text-gray-300 truncate max-w-[70%]">{p.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-gray-600 font-bold">{p.date}</span>
                  <span className="text-[10px] text-cyan-400/60 font-bold">{p.tags?.length || 0} tag</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
