import test from "node:test";
import assert from "node:assert/strict";
import { resolveTier } from "../src/lib/tierLogic.ts";

// ---------------------------------------------------------------------------
// Tier resolution — SECURITY CRITICAL.
//
// Tests the REAL resolver (src/lib/tierLogic.ts:resolveTier), the pure decision
// that getRequestTier (src/lib/tier.ts) delegates to. The cookie carries ONLY
// an email identity hint; whether that identity is Pro is ALWAYS re-derived
// from the subscription store via the injected lookup. The cookie value itself
// is never trusted, so even a forged `pro=true` style cookie cannot grant Pro.
//
// In production getRequestTier reads the email from the cfc-user-email cookie
// and passes it here with the real isProSubscriber store lookup; the tests
// inject a pure store lookup so no fs/network is touched.
// ---------------------------------------------------------------------------

test("tier: store says pro -> pro is true (cookie email is just the hint)", () => {
  const store = (email: string | null) => email === "pro@user.com";
  const { tier } = resolveTier("pro@user.com", store);
  assert.equal(tier, "pro");
});

test("tier ABUSE: forged 'pro' value does NOT grant pro when store says free", () => {
  // The cookie only ever supplies the email. Even if an attacker controls that
  // email value, the store lookup decides — and here it says free.
  const store = (_email: string | null) => false; // store: this user is free
  const { tier } = resolveTier("attacker@evil.com", store);
  // Tier is derived from the store, never from the cookie -> free.
  assert.equal(tier, "free");
});

test("tier ABUSE: literal 'pro'/'true' as the cookie email is still gated by the store", () => {
  // An attacker stuffing the cookie with "pro" / "true" gains nothing.
  const store = (email: string | null) => email === "real-pro@user.com";
  assert.equal(resolveTier("pro", store).tier, "free");
  assert.equal(resolveTier("true", store).tier, "free");
});

test("tier: no cookie -> anonymous -> free", () => {
  const store = (email: string | null) => email === "pro@user.com";
  const { tier, email } = resolveTier(null, store);
  assert.equal(email, null);
  assert.equal(tier, "free");
});

test("tier: email is normalised to lower-case before the store lookup", () => {
  const store = (email: string | null) => email === "pro@user.com";
  const { tier, email } = resolveTier("Pro@User.com", store);
  assert.equal(email, "pro@user.com");
  assert.equal(tier, "pro");
});

test("tier: a pro email that the store has since canceled resolves to free", () => {
  // Even with the 'right' email, if the store no longer reports pro -> free.
  const store = (_email: string | null) => false; // subscription canceled
  const { tier } = resolveTier("pro@user.com", store);
  assert.equal(tier, "free");
});
