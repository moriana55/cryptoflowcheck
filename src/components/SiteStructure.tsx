"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "@/components/Toaster";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Markets", href: "/markets" },
  { label: "Compare", href: "/compare" },
  { label: "Blog", href: "/blog" },
  { label: "Exchanges", href: "/exchanges" },
  { label: "Heatmap", href: "/heatmap" },
  { label: "Events", href: "/events" },
  { label: "Pro", href: "/pricing" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-20 flex items-center border-b border-white/5 bg-bg-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-bg-card border border-glass-border rounded-xl flex items-center justify-center text-accent-cyan group-hover:scale-110 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 20V14M8 20V10M12 20V12M16 20V6M20 20V16"/></svg>
          </div>
          <span className="font-black text-lg tracking-tight">
            CRYPTO<span className="text-gradient">FLOWCHECK</span>.COM
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          {navItems.map(item => (
            <Link key={item.label} href={item.href} className="text-text-secondary text-sm font-bold hover:text-white transition-colors relative group py-2">
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-accent-cyan to-accent-purple group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toast("Account system coming soon", "info")}
            className="hidden md:block px-6 py-2.5 bg-bg-card border border-white/10 rounded-xl text-xs font-bold hover:border-accent-cyan/50 hover:shadow-[0_0_20px_rgba(0,242,255,0.1)] transition-all"
          >
            Account
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-20 left-0 right-0 bg-bg-dark/95 backdrop-blur-xl border-b border-white/5 md:hidden z-40">
          <nav className="container mx-auto px-6 py-6 flex flex-col gap-4">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm font-bold text-text-secondary hover:text-white transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => toast("Account system coming soon", "info")}
              className="mt-2 px-6 py-3 bg-bg-card border border-white/10 rounded-xl text-xs font-bold hover:border-accent-cyan/50 transition-all w-full"
            >
              Account
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
