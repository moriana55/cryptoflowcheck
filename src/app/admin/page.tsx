"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAdmin, getBlogPosts } from "@/lib/admin";
import { getCoinList } from "@/lib/coins";
import { LogOut, FileText, Coins, LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ coins: 0, blogs: 0 });
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      window.location.href = "/admin/login";
    } else {
      setStats({ coins: getCoinList().length, blogs: getBlogPosts().length });
    }
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest animate-pulse">Checking credentials...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      <header className="h-16 border-b border-white/5 flex items-center justify-between container mx-auto px-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-5 h-5 text-accent-cyan" />
          <span className="font-black text-sm tracking-tight">ADMIN PANEL</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("cfc-admin-session");
            router.push("/admin/login");
          }}
          className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </header>
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="glass-card text-center">
            <div className="text-3xl font-black text-accent-cyan">{stats.coins}</div>
            <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-2">Tracked Coins</div>
          </div>
          <div className="glass-card text-center">
            <div className="text-3xl font-black text-accent-purple">{stats.blogs}</div>
            <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-2">Blog Posts</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/blog" className="glass-card hover:-translate-y-1 transition-transform flex items-center gap-4">
            <FileText className="w-8 h-8 text-accent-cyan" />
            <div>
              <div className="text-sm font-black">Blog Manager</div>
              <div className="text-[10px] font-bold text-text-secondary">Create, edit, and delete blog posts</div>
            </div>
          </Link>
          <Link href="/admin/coins" className="glass-card hover:-translate-y-1 transition-transform flex items-center gap-4">
            <Coins className="w-8 h-8 text-accent-purple" />
            <div>
              <div className="text-sm font-black">Coin Manager</div>
              <div className="text-[10px] font-bold text-text-secondary">Add or remove custom coins</div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
