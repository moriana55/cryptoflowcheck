export interface CoinMeta {
  symbol: string;
  name: string;
  pair: string;
  maxSupply: number | null;
  circulatingSupply: number | null;
  category: string;
}

// NOTE: `circulatingSupply` below is a STATIC, hand-maintained approximation
// captured at a point in time. It drifts as tokens are minted/burned/unlocked,
// so any market_cap derived from it (see src/lib/binance.ts) is an estimate
// only and grows less accurate over time. The live CoinGecko `/global` endpoint
// is the source of truth for total market cap and BTC dominance; these figures
// are used as inputs for per-coin display and as a last-resort fallback.
// TODO: pull live circulating supply per coin from CoinGecko to replace this.
export const DEFAULT_COIN_MAP: Record<string, CoinMeta> = {
  bitcoin: { symbol: "btc", name: "Bitcoin", pair: "BTCUSDT", maxSupply: 21000000, circulatingSupply: 19800000, category: "LAYER 1" },
  ethereum: { symbol: "eth", name: "Ethereum", pair: "ETHUSDT", maxSupply: null, circulatingSupply: 120690000, category: "LAYER 1" },
  binancecoin: { symbol: "bnb", name: "BNB", pair: "BNBUSDT", maxSupply: 200000000, circulatingSupply: 140890000, category: "EXCHANGE" },
  solana: { symbol: "sol", name: "Solana", pair: "SOLUSDT", maxSupply: null, circulatingSupply: 470000000, category: "LAYER 1" },
  ripple: { symbol: "xrp", name: "XRP", pair: "XRPUSDT", maxSupply: 100000000000, circulatingSupply: 57000000000, category: "LAYER 1" },
  dogecoin: { symbol: "doge", name: "Dogecoin", pair: "DOGEUSDT", maxSupply: null, circulatingSupply: 147000000000, category: "MEMES" },
  cardano: { symbol: "ada", name: "Cardano", pair: "ADAUSDT", maxSupply: 45000000000, circulatingSupply: 36000000000, category: "LAYER 1" },
  tron: { symbol: "trx", name: "TRON", pair: "TRXUSDT", maxSupply: null, circulatingSupply: 86000000000, category: "LAYER 1" },
  avalanche: { symbol: "avax", name: "Avalanche", pair: "AVAXUSDT", maxSupply: 720000000, circulatingSupply: 410000000, category: "LAYER 1" },
  chainlink: { symbol: "link", name: "Chainlink", pair: "LINKUSDT", maxSupply: 1000000000, circulatingSupply: 630000000, category: "DEFI" },
  polkadot: { symbol: "dot", name: "Polkadot", pair: "DOTUSDT", maxSupply: null, circulatingSupply: 1500000000, category: "LAYER 1" },
  polygon: { symbol: "matic", name: "Polygon", pair: "MATICUSDT", maxSupply: 10000000000, circulatingSupply: 10000000000, category: "LAYER 1" },
  litecoin: { symbol: "ltc", name: "Litecoin", pair: "LTCUSDT", maxSupply: 84000000, circulatingSupply: 75000000, category: "LAYER 1" },
  "shiba-inu": { symbol: "shib", name: "Shiba Inu", pair: "SHIBUSDT", maxSupply: null, circulatingSupply: 589000000000000, category: "MEMES" },
  uniswap: { symbol: "uni", name: "Uniswap", pair: "UNIUSDT", maxSupply: 1000000000, circulatingSupply: 600000000, category: "DEFI" },
  pepe: { symbol: "pepe", name: "Pepe", pair: "PEPEUSDT", maxSupply: 420690000000000, circulatingSupply: 420690000000000, category: "MEMES" },
  near: { symbol: "near", name: "NEAR Protocol", pair: "NEARUSDT", maxSupply: 1000000000, circulatingSupply: 1200000000, category: "LAYER 1" },
  aptos: { symbol: "apt", name: "Aptos", pair: "APTUSDT", maxSupply: null, circulatingSupply: 490000000, category: "LAYER 1" },
  sui: { symbol: "sui", name: "Sui", pair: "SUIUSDT", maxSupply: 10000000000, circulatingSupply: 3200000000, category: "LAYER 1" },
  arbitrum: { symbol: "arb", name: "Arbitrum", pair: "ARBUSDT", maxSupply: 10000000000, circulatingSupply: 4000000000, category: "LAYER 1" },
  optimism: { symbol: "op", name: "Optimism", pair: "OPUSDT", maxSupply: 4294967296, circulatingSupply: 1700000000, category: "LAYER 1" },
  filecoin: { symbol: "fil", name: "Filecoin", pair: "FILUSDT", maxSupply: null, circulatingSupply: 620000000, category: "AI COINS" },
  cosmos: { symbol: "atom", name: "Cosmos", pair: "ATOMUSDT", maxSupply: null, circulatingSupply: 390000000, category: "LAYER 1" },
  render: { symbol: "render", name: "Render", pair: "RENDERUSDT", maxSupply: 530000000, circulatingSupply: 390000000, category: "AI COINS" },
  injective: { symbol: "inj", name: "Injective", pair: "INJUSDT", maxSupply: null, circulatingSupply: 99000000, category: "DEFI" },
  "fetch-ai": { symbol: "fet", name: "Fetch.ai", pair: "FETUSDT", maxSupply: 2630000000, circulatingSupply: 2630000000, category: "AI COINS" },
  sei: { symbol: "sei", name: "Sei", pair: "SEIUSDT", maxSupply: 10000000000, circulatingSupply: 5200000000, category: "LAYER 1" },
  celestia: { symbol: "tia", name: "Celestia", pair: "TIAUSDT", maxSupply: null, circulatingSupply: 470000000, category: "LAYER 1" },
  fantom: { symbol: "ftm", name: "Fantom", pair: "FTMUSDT", maxSupply: 3175000000, circulatingSupply: 2800000000, category: "LAYER 1" },
  aave: { symbol: "aave", name: "Aave", pair: "AAVEUSDT", maxSupply: 16000000, circulatingSupply: 15000000, category: "DEFI" },
  algorand: { symbol: "algo", name: "Algorand", pair: "ALGOUSDT", maxSupply: 10000000000, circulatingSupply: 8300000000, category: "LAYER 1" },
  wif: { symbol: "wif", name: "dogwifhat", pair: "WIFUSDT", maxSupply: null, circulatingSupply: 998900000, category: "MEMES" },
  bonk: { symbol: "bonk", name: "Bonk", pair: "BONKUSDT", maxSupply: null, circulatingSupply: 76900000000000, category: "MEMES" },
  floki: { symbol: "floki", name: "FLOKI", pair: "FLOKIUSDT", maxSupply: null, circulatingSupply: 9700000000000, category: "MEMES" },
  ondo: { symbol: "ondo", name: "Ondo", pair: "ONDOUSDT", maxSupply: 10000000000, circulatingSupply: 3200000000, category: "DEFI" },
  worldcoin: { symbol: "wld", name: "Worldcoin", pair: "WLDUSDT", maxSupply: 10000000000, circulatingSupply: 510000000, category: "AI COINS" },
  jupiter: { symbol: "jup", name: "Jupiter", pair: "JUPUSDT", maxSupply: 10000000000, circulatingSupply: 1500000000, category: "DEFI" },
  starknet: { symbol: "strk", name: "Starknet", pair: "STRKUSDT", maxSupply: 10000000000, circulatingSupply: 2200000000, category: "LAYER 1" },
  "ethereum-classic": { symbol: "etc", name: "Ethereum Classic", pair: "ETCUSDT", maxSupply: 210700000, circulatingSupply: 148000000, category: "LAYER 1" },
  hedera: { symbol: "hbar", name: "Hedera", pair: "HBARUSDT", maxSupply: 50000000000, circulatingSupply: 38000000000, category: "LAYER 1" },
};

const CUSTOM_COINS_KEY = "cfc-custom-coins";

export function getCustomCoins(): Record<string, CoinMeta> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CUSTOM_COINS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function setCustomCoins(map: Record<string, CoinMeta>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_COINS_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("coins-change"));
  }
}

export function getCoinMap(): Record<string, CoinMeta> {
  return { ...DEFAULT_COIN_MAP, ...getCustomCoins() };
}

export function getCoinList() {
  return Object.entries(getCoinMap()).map(([id, meta]) => ({ id, ...meta }));
}

export function addCustomCoin(id: string, meta: CoinMeta) {
  const custom = getCustomCoins();
  custom[id] = meta;
  setCustomCoins(custom);
}

export function removeCustomCoin(id: string) {
  const custom = getCustomCoins();
  delete custom[id];
  setCustomCoins(custom);
}

export function resetCoins() {
  setCustomCoins({});
}
