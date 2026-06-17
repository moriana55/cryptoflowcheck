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
    <div className="glass-panel rounded-xl overflow-hidden border-outline-variant/30 !p-0">
      <div className="p-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-geist text-label-md font-bold text-on-surface">LIVE SCANNER</span>
        </div>
        <span className="px-2 py-0.5 bg-primary-container/20 text-primary-container text-[10px] font-bold rounded">SIMULATED</span>
      </div>
      <div className="p-4 font-mono text-xs space-y-3 min-h-[160px]">
        {logs.map((log, i) => (
          <div key={i} className={`flex gap-3 ${i > 1 ? `opacity-${100 - i * 15}` : ""}`}>
            <span className="text-on-surface-variant">{log.time}</span>
            <span className={log.type === "in" ? "text-primary-container" : "text-secondary"}>{log.msg}</span>
            <span className="text-primary">{log.val}</span>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-on-surface-variant/40 italic">Initializing scanner...</div>
        )}
        <div className="animate-pulse flex gap-3">
          <span className="text-primary-container">_</span>
        </div>
      </div>
    </div>
  );
}
