import test from "node:test";
import assert from "node:assert/strict";
import {
  computePnL,
  portfolioTotals,
  type Holding,
} from "../src/lib/portfolio.ts";

// ---------------------------------------------------------------------------
// Portfolio P&L math (pure). computePnL / portfolioTotals take holdings + a
// price map and must never produce NaN or throw on edge inputs.
// ---------------------------------------------------------------------------

const holding = (over: Partial<Holding> = {}): Holding => ({
  id: "bitcoin",
  pair: "BTCUSDT",
  symbol: "BTC",
  name: "Bitcoin",
  amount: 2,
  avgCost: 100,
  ...over,
});

test("computePnL: happy path computes profit and percent", () => {
  const rows = computePnL(
    [holding({ amount: 2, avgCost: 100 })], // cost basis = 200
    { BTCUSDT: { price: 150, change24h: 1 } } // market value = 300
  );
  const r = rows[0];
  assert.equal(r.costValue, 200);
  assert.equal(r.marketValue, 300);
  assert.equal(r.pnl, 100);
  assert.equal(r.pnlPercent, 50); // +50%
  assert.equal(r.dropAlert, false);
});

test("computePnL: a 24h drop past the threshold flips dropAlert", () => {
  const rows = computePnL(
    [holding()],
    { BTCUSDT: { price: 90, change24h: -8 } },
    5 // threshold 5%
  );
  assert.equal(rows[0].dropAlert, true);
  // pnl is negative (loss) but well-defined
  assert.equal(rows[0].pnl, 90 * 2 - 200);
});

test("computePnL: missing live price yields nulls, never NaN", () => {
  const rows = computePnL([holding()], {}); // no price for the pair
  const r = rows[0];
  assert.equal(r.livePrice, null);
  assert.equal(r.marketValue, null);
  assert.equal(r.pnl, null);
  assert.equal(r.pnlPercent, null);
  assert.equal(r.dropAlert, false);
});

test("computePnL EDGE: zero cost basis does not divide-by-zero into NaN", () => {
  const rows = computePnL(
    [holding({ amount: 1, avgCost: 0 })], // cost basis = 0
    { BTCUSDT: { price: 500, change24h: 0 } }
  );
  const r = rows[0];
  assert.equal(r.costValue, 0);
  assert.equal(r.marketValue, 500);
  assert.equal(r.pnl, 500);
  // percent must be null (guarded), NOT NaN/Infinity
  assert.equal(r.pnlPercent, null);
  assert.ok(!Number.isNaN(r.pnl));
});

test("portfolioTotals: aggregates across holdings", () => {
  const rows = computePnL(
    [
      holding({ id: "a", pair: "AUSDT", amount: 2, avgCost: 100 }), // cost 200 -> val 300
      holding({ id: "b", pair: "BUSDT", amount: 1, avgCost: 50 }), // cost 50 -> val 40
    ],
    {
      AUSDT: { price: 150, change24h: 0 },
      BUSDT: { price: 40, change24h: 0 },
    }
  );
  const totals = portfolioTotals(rows);
  assert.equal(totals.cost, 250);
  assert.equal(totals.value, 340);
  assert.equal(totals.pnl, 90);
  assert.equal(totals.pnlPercent, 36); // 90/250 = 36%
});

test("portfolioTotals EDGE: empty portfolio is all zeros, no NaN/throw", () => {
  const totals = portfolioTotals([]);
  assert.deepEqual(totals, { cost: 0, value: 0, pnl: 0, pnlPercent: 0 });
});
