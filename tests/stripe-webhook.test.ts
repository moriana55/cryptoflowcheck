import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";

// ---------------------------------------------------------------------------
// Stripe webhook signature verification.
//
// The route (src/app/api/stripe/webhook/route.ts) calls
//   getStripe().webhooks.constructEvent(body, sig, secret)
// directly. There is NO pure wrapper in the codebase, and extracting one would
// just re-wrap Stripe's own verifier, so we do not refactor the route.
//
// Instead we test the PRINCIPLE the route relies on with a tiny pure verifier
// that mirrors Stripe's documented v1 scheme:
//   signedPayload = `${timestamp}.${rawBody}`
//   expected      = HMAC_SHA256(secret, signedPayload)  (hex)
//   header        = `t=${timestamp},v1=${expected}`
// A valid signature verifies; any tamper to the body, timestamp or signature
// is rejected. This is exactly the guarantee the route depends on to reject
// forged events.
// ---------------------------------------------------------------------------

const SECRET = "whsec_test_secret_key_123";

/** Build a Stripe-style signature header for a body. */
function sign(body: string, secret = SECRET, ts = 1700000000): string {
  const signedPayload = `${ts}.${body}`;
  const v1 = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${ts},v1=${v1}`;
}

/** Pure mirror of Stripe's verification (constant-time compare). */
function verify(body: string, header: string, secret = SECRET): boolean {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string])
  );
  const ts = parts["t"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;
  const expected = createHmac("sha256", secret)
    .update(`${ts}.${body}`)
    .digest("hex");
  const a = Buffer.from(v1, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

const BODY = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });

test("stripe verify: a signature computed with the secret verifies", () => {
  const header = sign(BODY);
  assert.equal(verify(BODY, header), true);
});

test("stripe verify ABUSE: a TAMPERED body is rejected", () => {
  const header = sign(BODY); // signed for the original body
  const tampered = JSON.stringify({
    id: "evt_1",
    type: "checkout.session.completed",
    amount: 999999, // attacker injected field
  });
  assert.equal(verify(tampered, header), false);
});

test("stripe verify ABUSE: a forged/altered signature is rejected", () => {
  const header = sign(BODY).replace(/v1=.*/, "v1=" + "0".repeat(64));
  assert.equal(verify(BODY, header), false);
});

test("stripe verify ABUSE: signing with the wrong secret is rejected", () => {
  const header = sign(BODY, "whsec_attacker_guess");
  assert.equal(verify(BODY, header, SECRET), false);
});

test("stripe verify ABUSE: a tampered timestamp invalidates the signature", () => {
  const header = sign(BODY).replace(/^t=\d+/, "t=1700009999");
  assert.equal(verify(BODY, header), false);
});

test("stripe verify: a malformed header (missing v1) is rejected", () => {
  assert.equal(verify(BODY, "t=1700000000"), false);
});
