import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Crypto Markets — Prices, Volume & 24h Change | CryptoFlowCheck",
  description:
    "Real-time cryptocurrency market data: live prices, 24h change, and trading volume for Bitcoin, Ethereum, Solana and more, powered by Binance.",
  alternates: { canonical: "/markets" },
  openGraph: {
    title: "Live Crypto Markets | CryptoFlowCheck",
    description: "Real-time prices, 24h change and volume across major cryptocurrencies.",
    type: "website",
    url: "/markets",
  },
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
