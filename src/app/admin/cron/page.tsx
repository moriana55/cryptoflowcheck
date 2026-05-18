"use client";

import { useState } from "react";
import { Zap, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminCronPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; title?: string; error?: string } | null>(null);
  const [cronSecret, setCronSecret] = useState("");

  async function triggerCron() {
    if (!cronSecret) { alert("Cron Secret gir!"); return; }
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/cron/blog", {
        headers: { "Authorization": `Bearer ${cronSecret}` },
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, title: data.title });
      } else {
        setResult({ success: false, error: data.error || "Bilinmeyen hata" });
      }
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Cron & AI Blog Üretici</h1>
        <p className="text-sm text-gray-500 mt-1">Manuel olarak AI blog yazısı üret veya cron job{"'"}u test et</p>
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-5">
        <h3 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2">
          <Zap size={16} className="text-amber-400" /> Manuel Cron Tetikle
        </h3>
        <p className="text-[13px] text-gray-500">
          Bu buton <code className="text-cyan-400">/api/cron/blog</code> endpoint{"'"}ini çağırır.
          OpenAI ile güncel piyasa verilerine göre blog yazısı üretir ve kaydeder.
        </p>

        <input
          type="password"
          value={cronSecret}
          onChange={e => setCronSecret(e.target.value)}
          placeholder="CRON_SECRET"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400/30"
        />

        <button
          onClick={triggerCron}
          disabled={running}
          className="w-full py-4 bg-amber-400 text-[#0a0a0f] font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {running ? <><Loader2 size={16} className="animate-spin" /> AI Yazıyor...</> : <><Zap size={16} /> Blog Üret</>}
        </button>

        {result && (
          <div className={`rounded-xl p-4 border ${result.success ? "bg-emerald-400/10 border-emerald-400/30" : "bg-red-400/10 border-red-400/30"}`}>
            <div className="flex items-center gap-2">
              {result.success ? <CheckCircle size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-red-400" />}
              <span className="text-sm font-bold text-white">
                {result.success ? `Oluşturuldu: "${result.title}"` : `Hata: ${result.error}`}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-4">
        <h3 className="text-[13px] font-black uppercase tracking-widest flex items-center gap-2">
          <Clock size={16} className="text-cyan-400" /> Cron Job Bilgisi
        </h3>
        <div className="space-y-3 text-[13px]">
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-500">Schedule</span>
            <span className="text-white font-bold font-mono">0 8 * * * (Her gün 08:00)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-500">Endpoint</span>
            <span className="text-cyan-400 font-bold font-mono">/api/cron/blog</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-500">Auth</span>
            <span className="text-white font-bold font-mono">Bearer CRON_SECRET</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">AI Model</span>
            <span className="text-white font-bold">OpenAI GPT-4o</span>
          </div>
        </div>
      </div>
    </div>
  );
}
