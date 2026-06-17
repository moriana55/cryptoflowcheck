import type { Metadata, Viewport } from "next";
import { Geist, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Toaster } from "@/components/Toaster";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1326",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://cryptoflowcheck.com"),
  title: "CryptoFlowCheck | Professional On-Chain Intelligence",
  description: "Real-time blockchain scanner, whale tracking and alpha flow signals.",
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
    <html lang="en" className={`dark ${geist.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased font-manrope relative bg-background text-on-surface">
        <ParticleBackground />
        <Toaster />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
