/**
 * Wallet cost-basis / PnL — pure logic.
 *
 * FIFO realized & unrealized profit-and-loss over a wallet's native-ETH
 * movements. Dependency-free (no network / next / openai) so it can be unit
 * tested directly — same pattern as briefing.ts / tierLogic.ts / csv.ts.
 *
 * HONESTY RULES (no fabrication):
 *  - A movement whose USD price at transaction time is unknown contributes
 *    `null` to any figure that needs it; it is never silently treated as $0.
 *  - A disposal that exceeds the acquisitions we can see ("uncovered") has no
 *    cost basis we can prove — that portion is flagged, not invented.
 *  - Realized PnL sums ONLY disposals where both proceeds and matched cost are
 *    fully known. Everything uncertain is surfaced via counts + flags so the UI
 *    can mark it "unknown".
 *
 * Scope: native ETH only. ERC-20 / internal transfers / DEX swaps are not in
 * the native transaction list, so a wallet that traded tokens will show
 * "uncovered" disposals — which is correctly flagged rather than guessed.
 */

const EPS = 1e-12;

export interface Movement {
  hash: string;
  /** ISO timestamp. */
  timestamp: string;
  direction: "in" | "out";
  /** ETH amount, strictly > 0. */
  amountETH: number;
  /** ETH/USD price at transaction time, or null when unavailable. */
  priceUSD: number | null;
}

export interface Disposal {
  hash: string;
  timestamp: string;
  amountETH: number;
  proceedsUSD: number | null;
  costBasisUSD: number | null;
  gainUSD: number | null;
  /** ETH portion of this disposal not covered by any prior acquisition. */
  uncoveredETH: number;
  /** Reason a figure is null, for display. */
  note: string | null;
}

export interface PnlSummary {
  realizedPnlUSD: number;
  realizedProceedsUSD: number;
  realizedCostBasisUSD: number;
  knownDisposals: number;
  unknownDisposals: number;
  uncoveredETH: number;
  remainingETH: number;
  remainingCostBasisUSD: number | null;
  unrealizedPnlUSD: number | null;
  totalPnlUSD: number | null;
  unknownPriceMovements: number;
  currentPriceUSD: number | null;
  flags: string[];
  disposals: Disposal[];
}

interface Lot {
  amountETH: number;
  priceUSD: number | null;
  timestamp: string;
  hash: string;
}

function sortByTime(movements: Movement[]): Movement[] {
  // Stable chronological order; invalid timestamps sort last but keep input order.
  return movements
    .map((m, i) => ({ m, i }))
    .sort((a, b) => {
      const ta = new Date(a.m.timestamp).getTime();
      const tb = new Date(b.m.timestamp).getTime();
      const va = Number.isFinite(ta) ? ta : Number.POSITIVE_INFINITY;
      const vb = Number.isFinite(tb) ? tb : Number.POSITIVE_INFINITY;
      if (va !== vb) return va - vb;
      return a.i - b.i;
    })
    .map((x) => x.m);
}

/**
 * Compute FIFO PnL over native-ETH movements.
 *
 * @param movements  acquisitions ("in") and disposals ("out").
 * @param currentPriceUSD  spot ETH price for unrealized PnL, or null.
 */
export function computeFifoPnl(
  movements: Movement[],
  currentPriceUSD: number | null
): PnlSummary {
  const ordered = sortByTime(movements.filter((m) => m.amountETH > EPS));

  const lots: Lot[] = [];
  const disposals: Disposal[] = [];

  let realizedPnlUSD = 0;
  let realizedProceedsUSD = 0;
  let realizedCostBasisUSD = 0;
  let knownDisposals = 0;
  let unknownDisposals = 0;
  let uncoveredTotalETH = 0;

  for (const m of ordered) {
    if (m.direction === "in") {
      lots.push({
        amountETH: m.amountETH,
        priceUSD: m.priceUSD,
        timestamp: m.timestamp,
        hash: m.hash,
      });
      continue;
    }

    // Disposal: consume oldest lots first.
    let remaining = m.amountETH;
    let matchedCostKnown = true;
    let matchedCost = 0;

    while (remaining > EPS && lots.length > 0) {
      const lot = lots[0];
      const take = Math.min(lot.amountETH, remaining);
      if (lot.priceUSD == null) matchedCostKnown = false;
      else matchedCost += take * lot.priceUSD;
      lot.amountETH -= take;
      remaining -= take;
      if (lot.amountETH <= EPS) lots.shift();
    }

    const uncovered = remaining > EPS ? remaining : 0;
    if (uncovered > 0) uncoveredTotalETH += uncovered;

    const proceedsUSD = m.priceUSD == null ? null : m.amountETH * m.priceUSD;
    const costKnown = matchedCostKnown && uncovered <= EPS;
    const costBasisUSD = costKnown ? matchedCost : null;
    const gainUSD =
      proceedsUSD != null && costBasisUSD != null ? proceedsUSD - costBasisUSD : null;

    let note: string | null = null;
    if (uncovered > 0) {
      note =
        "Disposal exceeds recorded acquisitions (likely token/internal transfers outside native ETH) — cost basis unknown.";
    } else if (proceedsUSD == null) {
      note = "Price at transaction time unavailable — proceeds unknown.";
    } else if (costBasisUSD == null) {
      note = "An acquisition lot lacked a known price — cost basis unknown.";
    }

    if (gainUSD != null) {
      realizedPnlUSD += gainUSD;
      realizedProceedsUSD += proceedsUSD!;
      realizedCostBasisUSD += costBasisUSD!;
      knownDisposals++;
    } else {
      unknownDisposals++;
    }

    disposals.push({
      hash: m.hash,
      timestamp: m.timestamp,
      amountETH: m.amountETH,
      proceedsUSD,
      costBasisUSD,
      gainUSD,
      uncoveredETH: uncovered,
      note,
    });
  }

  // Remaining open lots -> holdings + unrealized PnL.
  const remainingETH = lots.reduce((s, l) => s + l.amountETH, 0);
  const anyRemainingUnpriced = lots.some((l) => l.priceUSD == null);
  const remainingCostBasisUSD = anyRemainingUnpriced
    ? null
    : lots.reduce((s, l) => s + l.amountETH * (l.priceUSD as number), 0);

  const unrealizedPnlUSD =
    currentPriceUSD != null && remainingCostBasisUSD != null
      ? remainingETH * currentPriceUSD - remainingCostBasisUSD
      : null;

  const totalPnlUSD =
    unrealizedPnlUSD != null && unknownDisposals === 0
      ? realizedPnlUSD + unrealizedPnlUSD
      : null;

  const unknownPriceMovements = ordered.filter((m) => m.priceUSD == null).length;

  const flags: string[] = [];
  if (uncoveredTotalETH > EPS) {
    flags.push(
      `${uncoveredTotalETH.toFixed(4)} ETH was disposed without a matching acquisition in the available history. Cost basis for those portions is unknown (only native ETH transfers are tracked).`
    );
  }
  if (unknownPriceMovements > 0) {
    flags.push(
      `${unknownPriceMovements} transfer(s) had no available price at transaction time; their PnL is marked unknown.`
    );
  }
  if (anyRemainingUnpriced) {
    flags.push(
      "Some currently-held ETH lacks a known acquisition price, so unrealized PnL is incomplete."
    );
  }

  return {
    realizedPnlUSD,
    realizedProceedsUSD,
    realizedCostBasisUSD,
    knownDisposals,
    unknownDisposals,
    uncoveredETH: uncoveredTotalETH,
    remainingETH,
    remainingCostBasisUSD,
    unrealizedPnlUSD,
    totalPnlUSD,
    unknownPriceMovements,
    currentPriceUSD,
    flags,
    disposals,
  };
}

export interface YearlyTaxRow {
  year: string;
  proceedsUSD: number;
  costBasisUSD: number;
  realizedPnlUSD: number;
  knownDisposals: number;
  unknownDisposals: number;
}

/**
 * Group realized disposals by UTC year for a tax-style summary. Only fully
 * known disposals contribute to the USD totals; disposals with any unknown
 * component are counted under `unknownDisposals` for that year.
 */
export function yearlyTaxBreakdown(summary: PnlSummary): YearlyTaxRow[] {
  const byYear = new Map<string, YearlyTaxRow>();

  for (const d of summary.disposals) {
    const t = new Date(d.timestamp).getTime();
    const year = Number.isFinite(t)
      ? new Date(t).getUTCFullYear().toString()
      : "Unknown";

    let row = byYear.get(year);
    if (!row) {
      row = {
        year,
        proceedsUSD: 0,
        costBasisUSD: 0,
        realizedPnlUSD: 0,
        knownDisposals: 0,
        unknownDisposals: 0,
      };
      byYear.set(year, row);
    }

    if (d.gainUSD != null && d.proceedsUSD != null && d.costBasisUSD != null) {
      row.proceedsUSD += d.proceedsUSD;
      row.costBasisUSD += d.costBasisUSD;
      row.realizedPnlUSD += d.gainUSD;
      row.knownDisposals++;
    } else {
      row.unknownDisposals++;
    }
  }

  return [...byYear.values()].sort((a, b) => a.year.localeCompare(b.year));
}

/** Minimal native-transfer shape (decoupled from the Blockscout WalletTx type). */
export interface RawTransfer {
  hash: string;
  timestamp: string;
  /** Native value in wei (string). */
  valueWei: string;
  fromHash: string | null;
  toHash: string | null;
  failed: boolean;
}

/**
 * Map raw native-ETH transfers to FIFO movements for a given wallet.
 *
 * - Failed transactions and zero-value (token-only / pure contract-call) txns
 *   are skipped — they move no ETH.
 * - Self-transfers (from == to == wallet) are skipped to avoid double counting.
 * - `priceForDay` returns the ETH/USD close for a UTC day or null; a null price
 *   flows through as an unknown-price movement (never coerced to 0).
 */
export function transfersToMovements(
  transfers: RawTransfer[],
  address: string,
  priceForDay: (day: string) => number | null
): Movement[] {
  const addr = address.trim().toLowerCase();
  const movements: Movement[] = [];

  for (const t of transfers) {
    if (t.failed) continue;

    let amountETH = 0;
    try {
      amountETH = Number(BigInt(t.valueWei || "0")) / 1e18;
    } catch {
      continue; // malformed value
    }
    if (!Number.isFinite(amountETH) || amountETH <= EPS) continue;

    const from = t.fromHash?.toLowerCase() ?? null;
    const to = t.toHash?.toLowerCase() ?? null;
    if (from === addr && to === addr) continue; // self-transfer

    let direction: "in" | "out";
    if (to === addr) direction = "in";
    else if (from === addr) direction = "out";
    else continue; // unrelated to this wallet

    const day =
      typeof t.timestamp === "string" && t.timestamp.length >= 10
        ? t.timestamp.slice(0, 10)
        : "";
    const priceUSD = day ? priceForDay(day) : null;

    movements.push({
      hash: t.hash,
      timestamp: t.timestamp,
      direction,
      amountETH,
      priceUSD: priceUSD != null && Number.isFinite(priceUSD) ? priceUSD : null,
    });
  }

  return movements;
}
