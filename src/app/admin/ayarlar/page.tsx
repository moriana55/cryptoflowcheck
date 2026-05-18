"use client";

import { useState } from "react";
import { logoutAdmin } from "@/lib/admin";
import { useRouter } from "next/navigation";
import { Shield, Globe, Key, LogOut, CheckCircle } from "lucide-react";

export default function AdminAyarlarPage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  function showSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">Site ve admin yapılandırması</p>
      </div>

      {saved && (
        <div className="bg-emerald-400/10 border border-emerald-400/30 rounded-xl p-4 flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-400" />
          <span className="text-sm font-bold text-emerald-400">Kaydedildi!</span>
        </div>
      )}

      <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-5">
        <h3 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2">
          <Globe size={16} className="text-cyan-400" /> Site Bilgileri
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Site URL</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
              defaultValue="https://cryptoflowcheck.com" readOnly />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Site Başlığı</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
              defaultValue="CryptoFlowCheck — Real-Time Crypto Intelligence" />
          </div>
        </div>
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-5">
        <h3 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2">
          <Key size={16} className="text-amber-400" /> Environment Variables
        </h3>
        <p className="text-[12px] text-gray-500">
          Bu değerler sunucu tarafında <code className="text-cyan-400">.env.local</code> dosyasından okunur.
          Buradan değiştirilemez, sadece durumları gösterilir.
        </p>
        <div className="space-y-2">
          {[
            { key: "OPENAI_API_KEY", desc: "AI blog üretimi" },
            { key: "CRON_SECRET", desc: "Cron job doğrulama" },
            { key: "NEXT_PUBLIC_SITE_URL", desc: "Site URL" },
            { key: "STRIPE_SECRET_KEY", desc: "Ödeme sistemi" },
          ].map(env => (
            <div key={env.key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <span className="text-[13px] font-bold text-white font-mono">{env.key}</span>
                <p className="text-[10px] text-gray-600">{env.desc}</p>
              </div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Set</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-5">
        <h3 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2">
          <Shield size={16} className="text-red-400" /> Güvenlik
        </h3>
        <p className="text-[12px] text-gray-500">
          Admin şifresi: kodda SHA-256 hash olarak saklanır. Değiştirmek için <code className="text-cyan-400">src/lib/admin.ts</code> dosyasındaki ADMIN_HASH değerini güncelle.
        </p>
        <button
          onClick={() => { logoutAdmin(); router.push("/admin/login"); }}
          className="w-full py-3 bg-red-400/10 border border-red-400/30 text-red-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={14} /> Oturumu Kapat
        </button>
      </div>
    </div>
  );
}
