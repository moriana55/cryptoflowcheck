import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Cryptocurrencies Side by Side | CryptoFlowCheck",
  description:
    "Compare any two cryptocurrencies side by side — price, market cap, volume, momentum and AI-generated analysis to inform your decisions.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare Cryptocurrencies | CryptoFlowCheck",
    description: "Side-by-side crypto comparison with live data and AI insight.",
    type: "website",
    url: "/compare",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
