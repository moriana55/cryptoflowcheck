import test from "node:test";
import assert from "node:assert/strict";
import {
  transfersToMovements,
  computeFifoPnl,
  yearlyTaxBreakdown,
  type RawTransfer,
} from "../src/lib/pnl.ts";
import { buildPnlCsv } from "../src/lib/csv.ts";

// ---------------------------------------------------------------------------
// Transfer -> movement mapping + CSV rendering (the glue around the FIFO core).
// Pure, no network. Verifies the honest treatment of direction, zero-value /
// failed / self transfers, missing prices, and formula-injection-safe CSV.
// ---------------------------------------------------------------------------

const ME = "0xAAAA000000000000000000000000000000000001";
const OTHER = "0xBBBB000000000000000000000000000000000002";
const ONE_ETH = "1000000000000000000"; // 1e18 wei

function tx(over: Partial<RawTransfer>): RawTransfer {
  return {
    hash: "0xhash",
    timestamp: "2024-03-01T00:00:00Z",
    valueWei: ONE_ETH,
    fromHash: OTHER,
    toHash: ME,
    failed: false,
    ...over,
  };
}

const prices = (day: string): number | null =>
  ({ "2024-01-01": 1000, "2024-03-01": 3000 } as Record<string, number>)[day] ?? null;

test("mapper: inbound tx (to == wallet) becomes an 'in' movement priced by day", () => {
  const m = transfersToMovements([tx({ timestamp: "2024-01-01T12:00:00Z" })], ME, prices);
  assert.equal(m.length, 1);
  assert.equal(m[0].direction, "in");
  assert.equal(m[0].amountETH, 1);
  assert.equal(m[0].priceUSD, 1000);
});

test("mapper: outbound tx (from == wallet) becomes an 'out' movement", () => {
  const m = transfersToMovements([tx({ fromHash: ME, toHash: OTHER })], ME, prices);
  assert.equal(m[0].direction, "out");
});

test("mapper: case-insensitive address matching", () => {
  const m = transfersToMovements([tx({ toHash: ME.toLowerCase() })], ME.toUpperCase(), prices);
  assert.equal(m.length, 1);
  assert.equal(m[0].direction, "in");
});

test("mapper: failed, zero-value, self, and unrelated txns are dropped", () => {
  const m = transfersToMovements(
    [
      tx({ failed: true }),
      tx({ valueWei: "0" }),
      tx({ fromHash: ME, toHash: ME }), // self
      tx({ fromHash: OTHER, toHash: OTHER }), // unrelated
      tx({ valueWei: "not-a-number" }), // malformed
    ],
    ME,
    prices
  );
  assert.equal(m.length, 0);
});

test("mapper: a day with no price -> priceUSD null (never fabricated)", () => {
  const m = transfersToMovements([tx({ timestamp: "2099-12-31T00:00:00Z" })], ME, prices);
  assert.equal(m[0].priceUSD, null);
});

test("mapper -> FIFO end to end: buy@1000 then sell@3000 = +2000 realized", () => {
  const transfers = [
    tx({ hash: "0xbuy", timestamp: "2024-01-01T00:00:00Z", toHash: ME, fromHash: OTHER }),
    tx({ hash: "0xsell", timestamp: "2024-03-01T00:00:00Z", fromHash: ME, toHash: OTHER }),
  ];
  const moves = transfersToMovements(transfers, ME, prices);
  const s = computeFifoPnl(moves, 3500);
  assert.ok(Math.abs(s.realizedPnlUSD - 2000) < 1e-6);
  assert.equal(s.knownDisposals, 1);
});

// --- CSV ---------------------------------------------------------------------

test("csv: includes the mandatory tax disclaimer", () => {
  const s = computeFifoPnl(
    transfersToMovements(
      [
        tx({ hash: "0xbuy", timestamp: "2024-01-01T00:00:00Z", toHash: ME, fromHash: OTHER }),
        tx({ hash: "0xsell", timestamp: "2024-03-01T00:00:00Z", fromHash: ME, toHash: OTHER }),
      ],
      ME,
      prices
    ),
    3500
  );
  const csv = buildPnlCsv({
    address: ME,
    generatedAt: "2026-06-29T00:00:00Z",
    currentPriceUSD: 3500,
    summary: s,
    yearly: yearlyTaxBreakdown(s),
  });
  assert.match(csv, /Verify with your tax advisor/i);
  assert.match(csv, /Realized PnL/);
  assert.match(csv, /YEARLY BREAKDOWN/);
});

test("csv: renders 'Unknown' (not 0) for null figures", () => {
  const s = computeFifoPnl(
    transfersToMovements([tx({ fromHash: ME, toHash: OTHER, timestamp: "2099-01-01T00:00:00Z" })], ME, prices),
    null
  );
  const csv = buildPnlCsv({
    address: ME,
    generatedAt: "2026-06-29T00:00:00Z",
    currentPriceUSD: null,
    summary: s,
    yearly: yearlyTaxBreakdown(s),
  });
  assert.match(csv, /Unrealized PnL,Unknown/);
});

test("csv ABUSE: a note starting with '=' is neutralised against formula injection", () => {
  const s = computeFifoPnl([], null);
  // Inject a dangerous flag to prove csvCell escaping is applied.
  s.flags.push("=HYPERLINK('http://evil')");
  const csv = buildPnlCsv({
    address: ME,
    generatedAt: "2026-06-29T00:00:00Z",
    currentPriceUSD: null,
    summary: s,
    yearly: [],
  });
  // The dangerous '=' must be neutralised with a leading single quote.
  assert.match(csv, /'=HYPERLINK/);
  assert.doesNotMatch(csv, /\n=HYPERLINK/);
});
