import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Crypto Exchanges Side by Side | CryptoFlowCheck",
  description:
    "Compare two cryptocurrency exchanges head to head — trading fees, security scores, features and overall ratings — to choose where to trade.",
  alternates: { canonical: "/compare/exchanges" },
  openGraph: {
    title: "Compare Crypto Exchanges | CryptoFlowCheck",
    description: "Head-to-head crypto exchange comparison: fees, security and ratings.",
    type: "website",
    url: "/compare/exchanges",
  },
};

export default function CompareExchangesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
