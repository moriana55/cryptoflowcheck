"use client";

import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notify() {
  listeners.forEach((l) => l([...toasts]));
}

export function toast(message: string, type: ToastType = "info") {
  const id = Math.random().toString(36).slice(2);
  toasts = [{ id, message, type }, ...toasts];
  notify();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }, 3000);
}

export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setList);
    return () => {
      listeners = listeners.filter((l) => l !== setList);
    };
  }, []);

  return (
    <div className="fixed top-24 right-6 z-[300] flex flex-col gap-3 pointer-events-none">
      {list.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto glass-card px-5 py-3 text-xs font-bold border-l-2 shadow-lg animate-in slide-in-from-right-4 fade-in duration-300 ${
            t.type === "success"
              ? "border-emerald-400 text-emerald-400"
              : t.type === "error"
              ? "border-red-400 text-red-400"
              : "border-accent-cyan text-accent-cyan"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
