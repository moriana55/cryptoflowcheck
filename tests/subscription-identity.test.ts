import test from "node:test";
import assert from "node:assert/strict";
import {
  issueSubscriptionIdentity,
  verifySubscriptionIdentity,
} from "../src/lib/subscriptionIdentity.ts";

test("subscription identity: signed token verifies", async () => {
  process.env.SUBSCRIPTION_COOKIE_SECRET = "test-secret-at-least-32-characters";
  const token = await issueSubscriptionIdentity("Pro@User.com", 1_700_000_000_000);
  assert.equal(
    await verifySubscriptionIdentity(token, 1_700_000_000_001),
    "pro@user.com"
  );
});

test("subscription identity: tampering and expiry fail closed", async () => {
  process.env.SUBSCRIPTION_COOKIE_SECRET = "test-secret-at-least-32-characters";
  const now = 1_700_000_000_000;
  const token = await issueSubscriptionIdentity("pro@user.com", now);
  assert.equal(await verifySubscriptionIdentity(`${token}0`, now + 1), null);
  assert.equal(await verifySubscriptionIdentity(token, now + 31 * 24 * 60 * 60 * 1000), null);
});

test("subscription identity: missing secret cannot issue or verify", async () => {
  delete process.env.SUBSCRIPTION_COOKIE_SECRET;
  assert.equal(await issueSubscriptionIdentity("pro@user.com"), null);
  assert.equal(await verifySubscriptionIdentity("token"), null);
});
