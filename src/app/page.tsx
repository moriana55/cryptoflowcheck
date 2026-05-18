import { DEFAULT_COIN_MAP } from "@/lib/coins";
import { fetchBinanceCoins, fetchFearGreed, fetchGlobalMarketData } from "@/lib/binance";
import HomeClient from "./HomeClient";
import type { Coin, GlobalMarketData } from "@/lib/types";

function getCoinListServer() {
  return Object.entries(DEFAULT_COIN_MAP).map(([id, meta]) => ({ id, ...meta }));
}

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const coinList = getCoinListServer();

  const [coinsData, fearGreedData, globalData] = await Promise.all([
    fetchBinanceCoins(coinList),
    fetchFearGreed(),
    fetchGlobalMarketData(coinList),
  ]);

  const coins: Coin[] = coinsData.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    current_price: c.current_price,
    market_cap: c.market_cap,
    total_volume: c.total_volume,
    price_change_percentage_24h: c.price_change_percentage_24h,
    category: c.category,
  }));

  const fearGreed = "value" in fearGreedData ? fearGreedData.value : null;
  const global: GlobalMarketData | null = "total_market_cap" in globalData ? globalData : null;

  return <HomeClient initialCoins={coins} initialFearGreed={fearGreed} initialGlobalData={global} />;
}
