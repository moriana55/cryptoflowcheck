// Type-only import (erased at runtime, so it adds no module dependency).
import type { PnlSummary, YearlyTaxRow } from "./pnl";

/**
 * Escape a CSV cell and neutralise spreadsheet formula injection.
 *
 * Cells starting with = + - @ tab or CR are prefixed with a single quote so
 * spreadsheets treat them as text instead of executing them as formulas. Cells
 * containing quote/comma/newline are RFC 4180 quoted.
 */
export function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // Prevent CSV formula injection (=, +, -, @, tab, CR).
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
}

// ---------------------------------------------------------------------------
// Wallet PnL / tax report -> formula-injection-safe CSV.
//
// Co-located with csvCell (rather than a separate module) so the value import
// of csvCell stays same-file: this keeps the builder loadable by the bare
// `node --test` runner, which can't resolve extensionless relative ESM imports.
// The PnlSummary/YearlyTaxRow imports above are type-only and erased at runtime.
// ---------------------------------------------------------------------------

export interface PnlCsvInput {
  address: string;
  generatedAt: string;
  currentPriceUSD: number | null;
  summary: PnlSummary;
  yearly: YearlyTaxRow[];
}

function pnlUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "Unknown";
  return n.toFixed(2);
}

function pnlEth(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "Unknown";
  return n.toFixed(6);
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(",");
}

export function buildPnlCsv(input: PnlCsvInput): string {
  const { address, generatedAt, currentPriceUSD, summary, yearly } = input;
  const out: string[] = [];

  out.push(csvRow(["CryptoFlowCheck — Wallet PnL & Tax Report"]));
  out.push(csvRow(["Address", address]));
  out.push(csvRow(["Generated", generatedAt]));
  out.push(csvRow(["Current ETH price (USD)", pnlUsd(currentPriceUSD)]));
  out.push(csvRow(["Basis", "FIFO, native ETH transfers only"]));
  out.push(
    csvRow([
      "DISCLAIMER",
      "Estimated figures for informational purposes only. Not tax or financial advice. Verify with your tax advisor before filing.",
    ])
  );
  out.push("");

  out.push(csvRow(["SUMMARY"]));
  out.push(csvRow(["Metric", "Value (USD unless noted)"]));
  out.push(csvRow(["Realized PnL", pnlUsd(summary.realizedPnlUSD)]));
  out.push(csvRow(["Realized proceeds", pnlUsd(summary.realizedProceedsUSD)]));
  out.push(csvRow(["Realized cost basis", pnlUsd(summary.realizedCostBasisUSD)]));
  out.push(csvRow(["Unrealized PnL", pnlUsd(summary.unrealizedPnlUSD)]));
  out.push(csvRow(["Total PnL", pnlUsd(summary.totalPnlUSD)]));
  out.push(csvRow(["Holdings (ETH)", pnlEth(summary.remainingETH)]));
  out.push(csvRow(["Holdings cost basis", pnlUsd(summary.remainingCostBasisUSD)]));
  out.push(csvRow(["Known disposals", summary.knownDisposals]));
  out.push(csvRow(["Unknown disposals", summary.unknownDisposals]));
  out.push(csvRow(["Uncovered ETH (no cost basis)", pnlEth(summary.uncoveredETH)]));
  out.push("");

  out.push(csvRow(["YEARLY BREAKDOWN"]));
  out.push(
    csvRow([
      "Year",
      "Proceeds (USD)",
      "Cost basis (USD)",
      "Realized PnL (USD)",
      "Known disposals",
      "Unknown disposals",
    ])
  );
  for (const y of yearly) {
    out.push(
      csvRow([
        y.year,
        pnlUsd(y.proceedsUSD),
        pnlUsd(y.costBasisUSD),
        pnlUsd(y.realizedPnlUSD),
        y.knownDisposals,
        y.unknownDisposals,
      ])
    );
  }
  out.push("");

  out.push(csvRow(["DISPOSALS (detail)"]));
  out.push(
    csvRow(["Date", "Tx hash", "ETH", "Proceeds (USD)", "Cost basis (USD)", "Gain (USD)", "Note"])
  );
  for (const d of summary.disposals) {
    out.push(
      csvRow([
        d.timestamp,
        d.hash,
        pnlEth(d.amountETH),
        pnlUsd(d.proceedsUSD),
        pnlUsd(d.costBasisUSD),
        pnlUsd(d.gainUSD),
        d.note ?? "",
      ])
    );
  }

  if (summary.flags.length > 0) {
    out.push("");
    out.push(csvRow(["NOTES"]));
    for (const f of summary.flags) out.push(csvRow([f]));
  }

  return out.join("\n");
}
