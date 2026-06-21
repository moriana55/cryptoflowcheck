import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto Market Heatmap — 24h Performance | CryptoFlowCheck",
  description:
    "Visualize 24-hour cryptocurrency performance at a glance with the CryptoFlowCheck market heatmap. Spot gainers, losers and market-wide trends instantly.",
  alternates: { canonical: "/heatmap" },
  openGraph: {
    title: "Crypto Market Heatmap | CryptoFlowCheck",
    description: "Visualize 24h crypto performance across the market at a glance.",
    type: "website",
    url: "/heatmap",
  },
};

export default function HeatmapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
