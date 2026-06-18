"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <header className="h-16 flex items-center border-b border-outline-variant/60 bg-surface/80 backdrop-blur-xl sticky top-0 z-50 supports-[backdrop-filter]:bg-surface/70">
      <div className="w-full max-w-container-max mx-auto px-gutter flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/30">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </span>
            <span className="font-geist text-headline-sm font-bold text-on-surface tracking-tight">
              CryptoFlow<span className="text-primary">Check</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`font-geist text-label-md uppercase tracking-widest transition-colors px-3 py-2 rounded-md ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toast("Account system coming soon", "info")}
            className="hidden md:inline-flex items-center px-5 py-2 bg-primary text-on-primary font-geist text-label-md font-bold rounded-lg hover:brightness-110 hover:shadow-[0_0_16px_rgba(34,211,238,0.35)] transition-all"
          >
            Connect Wallet
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/60 text-on-surface-variant hover:text-primary hover:border-primary/40 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-surface/95 backdrop-blur-xl border-b border-outline-variant/60 md:hidden z-40">
          <nav className="max-w-container-max mx-auto px-gutter py-6 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`font-geist text-label-md uppercase tracking-widest transition-colors py-2.5 px-3 rounded-md ${
                    active
                      ? "text-primary bg-primary/10"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => toast("Account system coming soon", "info")}
              className="mt-3 px-5 py-3 bg-primary text-on-primary font-geist text-label-md font-bold rounded-lg w-full"
            >
              Connect Wallet
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
