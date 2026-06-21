import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crypto Events & Market Calendar | CryptoFlowCheck",
  description:
    "Stay ahead of key cryptocurrency events and market-moving dates. Track upcoming catalysts that drive Bitcoin, Ethereum and altcoin price action.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Crypto Events & Market Calendar | CryptoFlowCheck",
    description: "Key crypto events and market-moving dates to watch.",
    type: "website",
    url: "/events",
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
