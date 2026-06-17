"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { isAdmin, logoutAdmin } from "@/lib/admin";
import { LayoutDashboard, FileText, Coins, Settings, LogOut, Zap, BarChart3 } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/metrics", label: "Metrikler", icon: BarChart3 },
  { href: "/admin/blog", label: "Blog Yazıları", icon: FileText },
  { href: "/admin/coins", label: "Coin Yönetimi", icon: Coins },
  { href: "/admin/cron", label: "Cron / AI", icon: Zap },
  { href: "/admin/ayarlar", label: "Ayarlar", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true);
      return;
    }
    if (!isAdmin()) {
      router.push("/admin/login");
    } else {
      setReady(true);
    }
  }, [pathname, router]);

  if (pathname === "/admin/login") return <>{children}</>;
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Checking credentials...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-gray-200">
      <aside className="w-[220px] bg-[#111118] border-r border-white/5 flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/5">
          <span className="text-[15px] font-black tracking-tight">
            Crypto<span className="text-cyan-400">Flow</span>
          </span>
          <p className="text-[10px] text-gray-600 mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>

        <nav className="flex-1 py-3">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-[13px] font-bold transition-colors ${
                  active ? "text-cyan-400 bg-cyan-400/5 border-r-2 border-cyan-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/5">
          <button
            onClick={() => { logoutAdmin(); router.push("/admin/login"); }}
            className="flex items-center gap-2 text-[11px] font-bold text-gray-600 hover:text-red-400 uppercase tracking-widest transition-colors"
          >
            <LogOut size={14} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
