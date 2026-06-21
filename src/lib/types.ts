export interface Coin {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  category?: string;
}

export interface GlobalMarketData {
  total_market_cap: number;
  // null when only an unreliable estimate is available (e.g. CoinGecko down);
  // the UI renders this as "—" instead of a misleading number.
  btc_dominance: number | null;
  market_cap_change_24h: number;
}
