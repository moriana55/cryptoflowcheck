"use client";
import { useEffect, useState } from "react";

const logTemplates = [
  { msg: "BTC Inflow", val: "$12.4M", type: "in" },
  { msg: "ETH Outflow", val: "$4.2M", type: "out" },
  { msg: "SOL Inflow", val: "$850K", type: "in" },
  { msg: "BNB Inflow", val: "$1.2M", type: "in" },
  { msg: "Whale Buy", val: "14.5 BTC", type: "in" },
  { msg: "PEPE Signal", val: "LONG", type: "in" },
];

export function TerminalScanner() {
  const [logs, setLogs] = useState<{ time: string; msg: string; val: string; type: string }[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setLogs(prev => [{ time, ...template }, ...prev].slice(0, 8));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card !p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
        <span className="text-[10px] font-black tracking-widest text-text-secondary uppercase">Live Blockchain Scanner</span>
        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
      </div>
      <div className="p-4 font-mono text-[11px] space-y-2.5 h-[240px] overflow-hidden">
        {logs.map((log, i) => (
          <div key={i} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
            <span className="text-white/20">{log.time}</span>
            <span className="text-text-secondary font-bold">{log.msg}</span>
            <span className={log.type === "in" ? "text-emerald-400" : "text-red-500"}>
              {log.val}
            </span>
            <span className={`text-[9px] px-1 rounded uppercase font-black ${
              log.type === "in" ? "bg-emerald-400/10 text-emerald-400" : "bg-red-500/10 text-red-500"
            }`}>
              {log.type === "in" ? "IN" : "OUT"}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-white/20 italic">Initializing scanner...</div>}
      </div>
    </div>
  );
}
