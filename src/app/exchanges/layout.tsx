import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Crypto Exchanges — Fees, Security & Ratings | CryptoFlowCheck",
  description:
    "Compare the top cryptocurrency exchanges by fees, security score, and overall rating. Find the best platform to trade Bitcoin, Ethereum and altcoins.",
  alternates: { canonical: "/exchanges" },
  openGraph: {
    title: "Best Crypto Exchanges | CryptoFlowCheck",
    description: "Top crypto exchanges compared by fees, security and ratings.",
    type: "website",
    url: "/exchanges",
  },
};

export default function ExchangesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
