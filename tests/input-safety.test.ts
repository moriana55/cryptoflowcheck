import test from "node:test";
import assert from "node:assert/strict";
import { isValidEmail } from "../src/lib/email.ts";
import { getSafeComparisonHref } from "../src/lib/safeComparisonLink.ts";

test("email validation accepts a bounded ordinary address", () => {
  assert.equal(isValidEmail("analyst@example.com"), true);
});

test("email validation rejects malformed and adversarial inputs", () => {
  assert.equal(isValidEmail("missing-domain@localhost"), false);
  assert.equal(isValidEmail("two@@example.com"), false);
  assert.equal(isValidEmail(" spaced@example.com"), false);
  assert.equal(isValidEmail(`${"a".repeat(255)}@example.com`), false);
});

test("comparison links are reconstructed from allowlisted exchange IDs", () => {
  const ids = new Set(["binance", "coinbase"]);
  assert.equal(
    getSafeComparisonHref("/compare/exchanges?b=coinbase&a=binance", ids),
    "/compare/exchanges?a=binance&b=coinbase"
  );
});

test("comparison links reject script, external, unknown, and extra-parameter URLs", () => {
  const ids = new Set(["binance", "coinbase"]);
  assert.equal(getSafeComparisonHref("javascript:alert(1)", ids), null);
  assert.equal(getSafeComparisonHref("//evil.example/compare/exchanges?a=binance&b=coinbase", ids), null);
  assert.equal(getSafeComparisonHref("/compare/exchanges?a=unknown&b=coinbase", ids), null);
  assert.equal(getSafeComparisonHref("/compare/exchanges?a=binance&b=coinbase&next=evil", ids), null);
});
