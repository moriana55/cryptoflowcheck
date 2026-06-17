/**
 * Client-side portfolio store.
 *
 * Holdings are persisted in localStorage, namespaced per user when an email
 * identity is known (the `cfc-user-email` cookie set after checkout) so two
 * accounts on the same browser don't collide. Falls back to an anonymous
 * bucket otherwise. Pure code — no API keys, no server round-trip required for
 * persistence. P&L is computed live from public Binance prices supplied by the
 * caller.
 */

export interface Holding {
  /** Internal coin id (matches the coins.ts map keys, e.g. "bitcoin"). */
  id: string;
  /** Trading pair used to look up the live price (e.g. "BTCUSDT"). */
  pair: string;
  symbol: string;
  name: string;
  /** Units held. */
  amount: number;
  /** Average cost basis in USD per unit. */
  avgCost: number;
}

export interface HoldingPnL extends Holding {
  livePrice: number | null;
  change24h: number | null;
  costValue: number;
  marketValue: number | null;
  pnl: number | null;
  pnlPercent: number | null;
  /** True when the coin dropped more than the configured threshold in 24h. */
  dropAlert: boolean;
}

const BASE_KEY = "cfc-portfolio";

/** Read the per-browser email identity hint (also used by the tier system). */
function currentEmail(): string {
  if (typeof document === "undefined") return "anon";
  const match = document.cookie.match(/(?:^|;\s*)cfc-user-email=([^;]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]).toLowerCase() || "anon";
    } catch {
      return "anon";
    }
  }
  return "anon";
}

function storageKey(): string {
  return `${BASE_KEY}:${currentEmail()}`;
}

export function getHoldings(): Holding[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHoldings(holdings: Holding[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), JSON.stringify(holdings));
  window.dispatchEvent(new Event("portfolio-change"));
}

/** Add or update a holding (matched by coin id). Amounts/costs are clamped. */
export function upsertHolding(input: Holding) {
  const holdings = getHoldings();
  const clean: Holding = {
    ...input,
    amount: Math.max(0, Number(input.amount) || 0),
    avgCost: Math.max(0, Number(input.avgCost) || 0),
  };
  const idx = holdings.findIndex((h) => h.id === clean.id);
  if (idx >= 0) holdings[idx] = clean;
  else holdings.push(clean);
  writeHoldings(holdings);
}

export function removeHolding(id: string) {
  writeHoldings(getHoldings().filter((h) => h.id !== id));
}

/**
 * Compute live P&L for every holding given a live-price map keyed by pair.
 * `dropThreshold` is the % drop (positive number, e.g. 5) that flips the daily
 * drop alert flag on.
 */
export function computePnL(
  holdings: Holding[],
  prices: Record<string, { price: number; change24h: number }>,
  dropThreshold = 5
): HoldingPnL[] {
  return holdings.map((h) => {
    const live = prices[h.pair];
    const livePrice = live ? live.price : null;
    const change24h = live ? live.change24h : null;
    const costValue = h.amount * h.avgCost;
    const marketValue = livePrice != null ? h.amount * livePrice : null;
    const pnl = marketValue != null ? marketValue - costValue : null;
    const pnlPercent =
      pnl != null && costValue > 0 ? (pnl / costValue) * 100 : null;
    const dropAlert =
      change24h != null && change24h <= -Math.abs(dropThreshold);
    return {
      ...h,
      livePrice,
      change24h,
      costValue,
      marketValue,
      pnl,
      pnlPercent,
      dropAlert,
    };
  });
}

export interface PortfolioTotals {
  cost: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export function portfolioTotals(rows: HoldingPnL[]): PortfolioTotals {
  const cost = rows.reduce((s, r) => s + r.costValue, 0);
  const value = rows.reduce((s, r) => s + (r.marketValue ?? 0), 0);
  const pnl = value - cost;
  return {
    cost,
    value,
    pnl,
    pnlPercent: cost > 0 ? (pnl / cost) * 100 : 0,
  };
}
