import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Toaster } from "@/components/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const merriweather = Merriweather({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07090F",
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
    <html lang="en" className={`dark ${inter.variable} ${merriweather.variable}`}>
      <body className="antialiased font-inter relative">
        <ParticleBackground />
        <Toaster />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
