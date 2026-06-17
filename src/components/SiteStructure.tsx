"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { toast } from "@/components/Toaster";

const navItems = [
  { label: "Markets", href: "/markets" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Alerts", href: "/alerts" },
  { label: "Compare", href: "/compare" },
  { label: "Heatmap", href: "/heatmap" },
  { label: "Events", href: "/events" },
  { label: "Pro", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="h-16 flex items-center border-b border-outline-variant/20 bg-surface/85 backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-container-max mx-auto px-gutter flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-geist text-headline-sm font-bold text-primary tracking-tight">
            CryptoFlowCheck
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-geist text-label-md uppercase tracking-widest transition-colors ${
                  i === 0 ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toast("Account system coming soon", "info")}
            className="hidden md:block px-5 py-2 bg-primary text-on-primary font-geist text-label-md font-bold rounded-lg hover:opacity-90 transition-all"
          >
            Connect Wallet
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/30 text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/20 md:hidden z-40">
          <nav className="max-w-container-max mx-auto px-gutter py-6 flex flex-col gap-4">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-geist text-label-md uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors py-2"
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => toast("Account system coming soon", "info")}
              className="mt-2 px-5 py-3 bg-primary text-on-primary font-geist text-label-md font-bold rounded-lg w-full"
            >
              Connect Wallet
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
