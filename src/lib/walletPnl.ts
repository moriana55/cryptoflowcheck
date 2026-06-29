/**
 * Server-side wallet PnL report builder.
 *
 * Stitches together the existing Blockscout transaction feed (wallet.ts) and
 * Binance historical/spot prices (binance.ts) into the pure FIFO engine
 * (pnl.ts). Every upstream fetch is null-safe, so this never throws — a wallet
 * with no usable history simply yields a zeroed summary with explanatory flags.
 *
 * Scope: native ETH only (token swaps appear as "uncovered" disposals and are
 * flagged, never guessed). History is a single Blockscout page; deeper history
 * needs pagination (see owner notes).
 */
import { fetchWalletTransactions } from "@/lib/wallet";
import { fetchDailyCloseMap, fetchSpotPrice } from "@/lib/binance";
import {
  computeFifoPnl,
  transfersToMovements,
  yearlyTaxBreakdown,
  type PnlSummary,
  type YearlyTaxRow,
  type RawTransfer,
} from "@/lib/pnl";

export type PriceCoverage = "full" | "partial" | "none";

export interface WalletPnlReport {
  address: string;
  generatedAt: string;
  currentPriceUSD: number | null;
  /** Native transactions pulled from Blockscout. */
  txConsidered: number;
  /** ETH-moving movements actually fed into the FIFO engine. */
  ethMovements: number;
  priceCoverage: PriceCoverage;
  summary: PnlSummary;
  yearly: YearlyTaxRow[];
}

const ETH_PAIR = "ETHUSDT";
const MAX_TX = 100;
const PRICE_HISTORY_DAYS = 1000; // Binance daily-klines cap.

export async function computeWalletPnlReport(address: string): Promise<WalletPnlReport> {
  const generatedAt = new Date().toISOString();

  const [txs, priceMap, currentPriceUSD] = await Promise.all([
    fetchWalletTransactions(address, MAX_TX),
    fetchDailyCloseMap(ETH_PAIR, PRICE_HISTORY_DAYS),
    fetchSpotPrice(ETH_PAIR),
  ]);

  const transfers: RawTransfer[] = txs.map((t) => ({
    hash: t.hash,
    timestamp: t.timestamp,
    valueWei: t.value,
    fromHash: t.from?.hash ?? null,
    toHash: t.to?.hash ?? null,
    failed: t.status === "error",
  }));

  const movements = transfersToMovements(
    transfers,
    address,
    (day) => priceMap.get(day) ?? null
  );

  const summary = computeFifoPnl(movements, currentPriceUSD);
  const yearly = yearlyTaxBreakdown(summary);

  const priced = movements.filter((m) => m.priceUSD != null).length;
  const priceCoverage: PriceCoverage =
    movements.length === 0 ? "none" : priced === movements.length ? "full" : priced === 0 ? "none" : "partial";

  return {
    address,
    generatedAt,
    currentPriceUSD,
    txConsidered: txs.length,
    ethMovements: movements.length,
    priceCoverage,
    summary,
    yearly,
  };
}
