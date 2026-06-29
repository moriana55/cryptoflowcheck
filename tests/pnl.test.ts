import test from "node:test";
import assert from "node:assert/strict";
import {
  computeFifoPnl,
  yearlyTaxBreakdown,
  type Movement,
} from "../src/lib/pnl.ts";

// ---------------------------------------------------------------------------
// Wallet FIFO cost-basis / PnL — SECURITY/CORRECTNESS CRITICAL (it underpins a
// paid tax report). Tests the REAL engine (src/lib/pnl.ts). Core invariant:
// nothing is fabricated — unknown prices and uncovered disposals must surface
// as null + flags, never as $0 or an invented cost basis.
// ---------------------------------------------------------------------------

function mv(
  hash: string,
  timestamp: string,
  direction: "in" | "out",
  amountETH: number,
  priceUSD: number | null
): Movement {
  return { hash, timestamp, direction, amountETH, priceUSD };
}

const approx = (a: number, b: number, eps = 1e-6) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);

test("FIFO: single buy then full sell -> correct realized gain", () => {
  const moves = [
    mv("h1", "2024-01-01T00:00:00Z", "in", 1, 2000),
    mv("h2", "2024-06-01T00:00:00Z", "out", 1, 3000),
  ];
  const s = computeFifoPnl(moves, 3500);
  approx(s.realizedPnlUSD, 1000); // 3000 proceeds - 2000 cost
  approx(s.realizedProceedsUSD, 3000);
  approx(s.realizedCostBasisUSD, 2000);
  assert.equal(s.knownDisposals, 1);
  assert.equal(s.unknownDisposals, 0);
  approx(s.remainingETH, 0);
  approx(s.uncoveredETH, 0);
  assert.equal(s.flags.length, 0);
});

test("FIFO: consumes OLDEST lots first (true FIFO ordering)", () => {
  const moves = [
    mv("b1", "2024-01-01T00:00:00Z", "in", 1, 1000), // oldest, cheap
    mv("b2", "2024-02-01T00:00:00Z", "in", 1, 2000),
    mv("s1", "2024-03-01T00:00:00Z", "out", 1, 3000), // should match b1 @1000
  ];
  const s = computeFifoPnl(moves, null);
  approx(s.realizedPnlUSD, 2000); // 3000 - 1000 (oldest)
  approx(s.remainingETH, 1); // b2 still open
});

test("FIFO: partial sell spanning two lots blends cost basis", () => {
  const moves = [
    mv("b1", "2024-01-01T00:00:00Z", "in", 1, 1000),
    mv("b2", "2024-02-01T00:00:00Z", "in", 1, 2000),
    mv("s1", "2024-03-01T00:00:00Z", "out", 1.5, 4000), // 1@1000 + 0.5@2000 = 2000 cost
  ];
  const s = computeFifoPnl(moves, null);
  approx(s.realizedCostBasisUSD, 2000);
  approx(s.realizedProceedsUSD, 6000); // 1.5 * 4000
  approx(s.realizedPnlUSD, 4000);
  approx(s.remainingETH, 0.5); // 0.5 of b2 left
});

test("HONESTY: unknown sell price -> proceeds & gain null, counted unknown, not $0", () => {
  const moves = [
    mv("b1", "2024-01-01T00:00:00Z", "in", 1, 2000),
    mv("s1", "2024-06-01T00:00:00Z", "out", 1, null), // price unknown
  ];
  const s = computeFifoPnl(moves, 3000);
  assert.equal(s.disposals[0].proceedsUSD, null);
  assert.equal(s.disposals[0].gainUSD, null);
  assert.equal(s.knownDisposals, 0);
  assert.equal(s.unknownDisposals, 1);
  approx(s.realizedPnlUSD, 0); // nothing KNOWN realized — but flagged, not invented
  assert.ok(s.flags.some((f) => /price/i.test(f)));
});

test("HONESTY: unknown buy price -> later sell has null cost basis", () => {
  const moves = [
    mv("b1", "2024-01-01T00:00:00Z", "in", 1, null), // acquisition price unknown
    mv("s1", "2024-06-01T00:00:00Z", "out", 1, 3000),
  ];
  const s = computeFifoPnl(moves, null);
  assert.equal(s.disposals[0].costBasisUSD, null);
  assert.equal(s.disposals[0].gainUSD, null);
  assert.equal(s.unknownDisposals, 1);
});

test("HONESTY: sell with no prior buy -> uncovered, cost basis unknown, flagged", () => {
  const moves = [
    mv("s1", "2024-06-01T00:00:00Z", "out", 2, 3000), // no acquisitions seen
  ];
  const s = computeFifoPnl(moves, null);
  approx(s.uncoveredETH, 2);
  assert.equal(s.disposals[0].costBasisUSD, null);
  assert.equal(s.disposals[0].gainUSD, null);
  assert.equal(s.unknownDisposals, 1);
  assert.ok(s.flags.some((f) => /without a matching acquisition/i.test(f)));
});

test("HONESTY: partially-uncovered sell is fully marked unknown (no half-invented basis)", () => {
  const moves = [
    mv("b1", "2024-01-01T00:00:00Z", "in", 1, 1000),
    mv("s1", "2024-06-01T00:00:00Z", "out", 3, 3000), // 1 covered, 2 uncovered
  ];
  const s = computeFifoPnl(moves, null);
  approx(s.disposals[0].uncoveredETH, 2);
  assert.equal(s.disposals[0].costBasisUSD, null); // not just the 1 ETH cost
  assert.equal(s.disposals[0].gainUSD, null);
});

test("unrealized: open lot valued at current price", () => {
  const moves = [mv("b1", "2024-01-01T00:00:00Z", "in", 2, 1500)];
  const s = computeFifoPnl(moves, 2000);
  approx(s.remainingETH, 2);
  approx(s.remainingCostBasisUSD!, 3000); // 2 * 1500
  approx(s.unrealizedPnlUSD!, 1000); // 2*2000 - 3000
});

test("unrealized: null current price -> unrealized null, never guessed", () => {
  const moves = [mv("b1", "2024-01-01T00:00:00Z", "in", 1, 1500)];
  const s = computeFifoPnl(moves, null);
  assert.equal(s.unrealizedPnlUSD, null);
  assert.equal(s.totalPnlUSD, null);
});

test("totalPnlUSD only when realized fully known AND unrealized known", () => {
  const clean = computeFifoPnl(
    [
      mv("b1", "2024-01-01T00:00:00Z", "in", 2, 1000),
      mv("s1", "2024-06-01T00:00:00Z", "out", 1, 2000),
    ],
    3000
  );
  // realized 1000, remaining 1 @1000 -> unrealized 2000 -> total 3000
  approx(s_total(clean), 3000);

  const dirty = computeFifoPnl(
    [mv("s1", "2024-06-01T00:00:00Z", "out", 1, 2000)], // uncovered
    3000
  );
  assert.equal(dirty.totalPnlUSD, null);
});
function s_total(s: ReturnType<typeof computeFifoPnl>) {
  assert.ok(s.totalPnlUSD != null);
  return s.totalPnlUSD as number;
}

test("ordering: out-of-order timestamps are sorted chronologically before FIFO", () => {
  const moves = [
    mv("s1", "2024-03-01T00:00:00Z", "out", 1, 3000),
    mv("b1", "2024-01-01T00:00:00Z", "in", 1, 1000), // earlier, listed later
  ];
  const s = computeFifoPnl(moves, null);
  approx(s.realizedPnlUSD, 2000); // buy is processed first despite input order
  assert.equal(s.unknownDisposals, 0);
});

test("guards: zero/negative amounts are ignored, no NaN", () => {
  const moves = [
    mv("z", "2024-01-01T00:00:00Z", "in", 0, 1000),
    mv("b1", "2024-01-02T00:00:00Z", "in", 1, 1000),
    mv("s1", "2024-02-01T00:00:00Z", "out", 1, 2000),
  ];
  const s = computeFifoPnl(moves, 2500);
  approx(s.realizedPnlUSD, 1000);
  assert.ok(Number.isFinite(s.realizedPnlUSD));
});

// --- yearly tax breakdown ---------------------------------------------------

test("tax: groups realized disposals by UTC year", () => {
  const moves = [
    mv("b1", "2023-01-01T00:00:00Z", "in", 3, 1000),
    mv("s1", "2023-06-01T00:00:00Z", "out", 1, 2000), // 2023: +1000
    mv("s2", "2024-06-01T00:00:00Z", "out", 1, 1500), // 2024: +500
  ];
  const rows = yearlyTaxBreakdown(computeFifoPnl(moves, null));
  const y2023 = rows.find((r) => r.year === "2023")!;
  const y2024 = rows.find((r) => r.year === "2024")!;
  approx(y2023.realizedPnlUSD, 1000);
  approx(y2024.realizedPnlUSD, 500);
  assert.equal(y2023.knownDisposals, 1);
});

test("tax: unknown disposals counted per year but excluded from USD totals", () => {
  const moves = [
    mv("s1", "2024-06-01T00:00:00Z", "out", 1, null), // uncovered + unpriced
  ];
  const rows = yearlyTaxBreakdown(computeFifoPnl(moves, null));
  const y = rows.find((r) => r.year === "2024")!;
  assert.equal(y.unknownDisposals, 1);
  approx(y.realizedPnlUSD, 0);
});
