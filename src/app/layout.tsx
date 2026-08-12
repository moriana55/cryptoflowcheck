import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Toaster } from "@/components/Toaster";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1326",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cryptoflowcheck.com"),
  title: "CryptoFlowCheck | Crypto Market Intelligence",
  description: "Public-market crypto prices, comparisons, portfolio P&L and security-conscious subscription workflows.",
  keywords: ["crypto", "bitcoin", "ethereum", "binance", "market data", "trading", "blockchain", "altcoin"],
  authors: [{ name: "CryptoFlowCheck" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CryptoFlowCheck",
  },
  twitter: {
    card: "summary_large_image",
    site: "@cryptoflowcheck",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased font-manrope relative bg-background text-on-surface">
        <ParticleBackground />
        <Toaster />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
