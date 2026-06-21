const BINANCE_BASE = "https://api.binance.com/api/v3";

export interface BinanceCoin {
  id: string;
  symbol: string;
  name: string;
  image: null;
  market_cap_rank: number;
  current_price: number | null;
  market_cap: number | null;
  total_volume: number | null;
  price_change_percentage_24h: number | null;
  category: string;
}

export interface BinanceCoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: null;
  current_price: number;
  market_cap: number | null;
  market_cap_rank: null;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number | null;
  price_change_percentage_30d: number | null;
  circulating_supply: number | null;
  total_supply: null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: null;
  atl: number | null;
  atl_date: null;
}

export async function fetchBinanceCoins(
  coins: { id: string; pair: string; symbol: string; name: string; circulatingSupply: number | null; category: string }[]
): Promise<BinanceCoin[]> {
  if (coins.length === 0) return [];
  const pairs = coins.map((c) => c.pair);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${BINANCE_BASE}/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return coins.map((c, i) => ({
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        image: null,
        market_cap_rank: i + 1,
        current_price: null,
        market_cap: null,
        total_volume: null,
        price_change_percentage_24h: null,
        category: c.category,
      }));
    }

    interface Ticker {
      symbol: string;
      lastPrice: string;
      priceChangePercent: string;
      volume: string;
      quoteVolume: string;
    }

    const raw = await res.json();
    // Binance can return HTTP 200 with an error envelope ({code, msg}) instead
    // of the expected array — guard against it so we fall back cleanly.
    const tickers: Ticker[] = Array.isArray(raw) ? raw : [];
    const tickerMap = new Map(tickers.map((t) => [t.symbol, t]));

    return coins.map((c, i) => {
      const t = tickerMap.get(c.pair);
      return {
        id: c.id,
        symbol: c.symbol,
        name: c.name,
        image: null,
        market_cap_rank: i + 1,
        current_price: t ? Number(t.lastPrice) : null,
        market_cap: c.circulatingSupply && t ? Number(t.lastPrice) * c.circulatingSupply : null,
        // quoteVolume is the USD-denominated 24h volume (volume = base-asset
        // units). UI shows this as a currency, so use quoteVolume to stay
        // consistent with the coin detail page.
        total_volume: t ? Number(t.quoteVolume) : null,
        price_change_percentage_24h: t ? Number(t.priceChangePercent) : null,
        category: c.category,
      };
    });
  } catch {
    clearTimeout(timeout);
    return coins.map((c, i) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      image: null,
      market_cap_rank: i + 1,
      current_price: null,
      market_cap: null,
      total_volume: null,
      price_change_percentage_24h: null,
      category: c.category,
    }));
  }
}

export async function fetchBinanceCoinDetail(
  meta: { pair: string; symbol: string; name: string; circulatingSupply: number | null; maxSupply: number | null }
): Promise<BinanceCoinDetail | { error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const [tickerRes, klinesRes] = await Promise.all([
      fetch(`${BINANCE_BASE}/ticker/24hr?symbol=${meta.pair}`, { signal: controller.signal }),
      fetch(`${BINANCE_BASE}/klines?symbol=${meta.pair}&interval=1d&limit=90`, { signal: controller.signal }),
    ]);
    clearTimeout(timeout);

    if (!tickerRes.ok) return { error: "Binance API error" };

    const ticker = await tickerRes.json();
    const currentPrice = Number(ticker?.lastPrice);
    // Binance can return HTTP 200 with an error envelope ({code, msg}) for an
    // invalid symbol — lastPrice is then undefined, yielding NaN. Treat as error
    // so the UI shows "not found" instead of "$NaN".
    if (!Number.isFinite(currentPrice)) return { error: "Coin not found" };

    let pct7d: number | null = null;
    let pct30d: number | null = null;
    let ath: number | null = null;
    let atl: number | null = null;

    if (klinesRes.ok) {
      const klines: [number, string, string, string, string, string][] = await klinesRes.json();
      const closes = klines.map((k) => Number(k[4]));
      const highs = klines.map((k) => Number(k[2]));
      const lows = klines.map((k) => Number(k[3]));

      if (closes.length > 0) {
        ath = Math.max(...highs);
        atl = Math.min(...lows);
        if (closes.length >= 7) {
          const price7d = closes[closes.length - 7];
          pct7d = ((currentPrice - price7d) / price7d) * 100;
        }
        if (closes.length >= 30) {
          const price30d = closes[closes.length - 30];
          pct30d = ((currentPrice - price30d) / price30d) * 100;
        }
      }
    }

    return {
      id: "",
      symbol: meta.symbol,
      name: meta.name,
      image: null,
      current_price: currentPrice,
      market_cap: meta.circulatingSupply ? currentPrice * meta.circulatingSupply : null,
      market_cap_rank: null,
      total_volume: Number(ticker.quoteVolume),
      price_change_percentage_24h: Number(ticker.priceChangePercent),
      price_change_percentage_7d: pct7d,
      price_change_percentage_30d: pct30d,
      circulating_supply: meta.circulatingSupply,
      total_supply: null,
      max_supply: meta.maxSupply,
      ath,
      ath_change_percentage: ath ? ((currentPrice - ath) / ath) * 100 : null,
      ath_date: null,
      atl,
      atl_date: null,
    };
  } catch {
    clearTimeout(timeout);
    return { error: "Binance API unavailable" };
  }
}

export async function fetchBinanceChart(
  pair: string,
  days: number
): Promise<[number, number][]> {
  let interval: string;
  let limit: number;
  if (days <= 7) {
    interval = "1h";
    limit = days * 24;
  } else if (days <= 90) {
    interval = "4h";
    limit = Math.ceil(days * 6);
  } else {
    interval = "1d";
    limit = days;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${BINANCE_BASE}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return [];

    const klines: [number, string, string, string, string, string][] = await res.json();
    return klines.map((k) => [k[0], Number(k[4])]);
  } catch {
    clearTimeout(id);
    return [];
  }
}

export async function fetchFearGreed(): Promise<{ value: number; classification: string; timestamp?: string } | { error: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      signal: controller.signal,
      next: { revalidate: 3600 } as any,
    });
    clearTimeout(timeout);
    if (!res.ok) return { error: "API error" };
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return { error: "No data" };
    return { value: Number(item.value), classification: item.value_classification, timestamp: item.timestamp };
  } catch {
    clearTimeout(timeout);
    return { error: "API error" };
  }
}

export interface GlobalMarketData {
  total_market_cap: number;
  btc_dominance: number;
  market_cap_change_24h: number;
}

export async function fetchGlobalMarketData(
  coins: { id: string; pair: string; symbol: string; name: string; circulatingSupply: number | null; category: string }[]
): Promise<GlobalMarketData | { error: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      signal: controller.signal,
      next: { revalidate: 300 } as any,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const d = json.data;
      return {
        total_market_cap: d.total_market_cap?.usd ?? 0,
        btc_dominance: d.market_cap_percentage?.btc ?? 0,
        market_cap_change_24h: d.market_cap_change_percentage_24h_usd ?? 0,
      };
    }

    // Fallback: calculate from tracked coins if CoinGecko is down
    const data = await fetchBinanceCoins(coins);
    const totalMcap = data.reduce((sum, c) => sum + (c.market_cap ?? 0), 0);
    const btcCoin = data.find((c) => c.id === "bitcoin");
    const btcDominance = btcCoin?.market_cap && totalMcap > 0
      ? (btcCoin.market_cap / totalMcap) * 100
      : 0;
    const avgChange = data.length > 0
      ? data.reduce((sum, c) => sum + (c.price_change_percentage_24h ?? 0), 0) / data.length
      : 0;
    return {
      total_market_cap: totalMcap,
      btc_dominance: btcDominance,
      market_cap_change_24h: avgChange,
    };
  } catch {
    return { error: "Network error" };
  }
}
