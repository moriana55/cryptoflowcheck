import { Metadata } from "next";
import { DEFAULT_COIN_MAP } from "@/lib/coins";
import CoinDetailClient from "./CoinDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meta = DEFAULT_COIN_MAP[id];

  if (!meta) {
    return {
      title: "Coin Not Found | CryptoFlowCheck",
    };
  }

  const symbol = meta.symbol.toUpperCase();

  return {
    title: `${meta.name} (${symbol}) Price, Chart & Market Stats | CryptoFlowCheck`,
    description: `Track ${meta.name} live price, market cap, trading volume, and historical charts. Real-time ${symbol} data powered by Binance.`,
  };
}

export default function CoinPage() {
  return <CoinDetailClient />;
}
