import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Upgrade to CryptoFlowCheck Pro",
  description:
    "Unlock unlimited AI analysis, bulk CSV exports and advanced on-chain intelligence with CryptoFlowCheck Pro. See plans and pricing.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "CryptoFlowCheck Pro — Pricing",
    description: "Unlimited AI analysis, bulk exports and advanced intelligence.",
    type: "website",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
