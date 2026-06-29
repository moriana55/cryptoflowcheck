import test from "node:test";
import assert from "node:assert/strict";
import {
  isEthAddress,
  fetchWalletBalance,
  fetchWalletTransactions,
  fetchWalletTokens,
} from "../src/lib/wallet.ts";

// ---------------------------------------------------------------------------
// Wallet on-chain scanner (src/lib/wallet.ts).
//
// SECURITY: isEthAddress is the gate the /wallet/[address] page calls BEFORE
// any value is interpolated into a Blockscout URL — it prevents path/SSRF
// injection, so its strictness matters.
//
// RESILIENCE: the three fetch helpers proxy an external API. They must (a)
// pass an AbortSignal (the 8s timeout added so a stalled upstream can't hang
// the force-dynamic page render), (b) parse the happy path, and (c) fall back
// safely on a non-ok response or a thrown/aborted fetch — never throw.
//
// global.fetch is stubbed so no real network is touched.
// ---------------------------------------------------------------------------

// --- isEthAddress ----------------------------------------------------------

test("isEthAddress: a canonical 0x + 40 hex address is valid", () => {
  assert.equal(isEthAddress("0x52908400098527886E0F7030069857D2E4169EE7"), true);
  assert.equal(isEthAddress("0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae"), true);
});

test("isEthAddress: surrounding whitespace is tolerated (trimmed)", () => {
  assert.equal(isEthAddress("  0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae  "), true);
});

test("isEthAddress ABUSE: wrong length / missing prefix / non-hex is rejected", () => {
  assert.equal(isEthAddress(""), false);
  assert.equal(isEthAddress("0x"), false);
  assert.equal(isEthAddress("de0b295669a9fd93d5f28d9ec85e40f4cb697bae"), false); // no 0x
  assert.equal(isEthAddress("0xde0b295669a9fd93d5f28d9ec85e40f4cb697ba"), false); // 39 hex
  assert.equal(isEthAddress("0xde0b295669a9fd93d5f28d9ec85e40f4cb697baee"), false); // 41 hex
  assert.equal(isEthAddress("0xZZ0b295669a9fd93d5f28d9ec85e40f4cb697bae"), false); // non-hex
});

test("isEthAddress ABUSE: path/SSRF injection payloads are rejected", () => {
  assert.equal(isEthAddress("0xde0b2956/../../admin"), false);
  assert.equal(isEthAddress("../../etc/passwd"), false);
  assert.equal(isEthAddress("0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae?x=1"), false);
});

// --- fetch stub helpers ----------------------------------------------------

const realFetch = globalThis.fetch;

function withFetch(
  impl: (url: string, init: any) => Promise<unknown>,
  fn: () => Promise<void>
) {
  return async () => {
    (globalThis as any).fetch = impl as any;
    try {
      await fn();
    } finally {
      (globalThis as any).fetch = realFetch;
    }
  };
}

function okJson(body: unknown) {
  return { ok: true, json: async () => body } as unknown as Response;
}
function notOk() {
  return { ok: false, json: async () => ({}) } as unknown as Response;
}

const ADDR = "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae";

// --- fetchWalletBalance ----------------------------------------------------

test(
  "fetchWalletBalance: parses coin_balance (wei -> ETH) and USD, passes an AbortSignal",
  withFetch(
    async (_url, init) => {
      assert.ok(init?.signal instanceof AbortSignal, "expected an AbortSignal (timeout wiring)");
      return okJson({
        hash: ADDR,
        coin_balance: "1500000000000000000", // 1.5 ETH in wei
        exchange_rate: "2000",
        ens_domain_name: "vitalik.eth",
      });
    },
    async () => {
      const res = await fetchWalletBalance(ADDR);
      assert.ok(!("error" in res));
      const bal = res as Exclude<typeof res, { error: string }>;
      assert.equal(bal.balanceETH, 1.5);
      assert.equal(bal.balanceUSD, 3000);
      assert.equal(bal.ensName, "vitalik.eth");
      assert.equal(bal.address, ADDR);
    }
  )
);

test(
  "fetchWalletBalance: a malformed coin_balance degrades to 0 ETH (not a throw)",
  withFetch(
    async () => okJson({ hash: ADDR, coin_balance: "not-a-number" }),
    async () => {
      const res = await fetchWalletBalance(ADDR);
      assert.ok(!("error" in res));
      const bal = res as Exclude<typeof res, { error: string }>;
      assert.equal(bal.balanceETH, 0);
      assert.equal(bal.balanceUSD, null); // no exchange_rate -> null
    }
  )
);

test(
  "fetchWalletBalance: non-ok upstream -> { error }",
  withFetch(
    async () => notOk(),
    async () => {
      const res = await fetchWalletBalance(ADDR);
      assert.deepEqual(res, { error: "Wallet not found" });
    }
  )
);

test(
  "fetchWalletBalance: a thrown/aborted fetch -> { error } (never throws)",
  withFetch(
    async () => {
      throw new DOMException("aborted", "AbortError");
    },
    async () => {
      const res = await fetchWalletBalance(ADDR);
      assert.deepEqual(res, { error: "Network error" });
    }
  )
);

// --- fetchWalletTransactions -----------------------------------------------

test(
  "fetchWalletTransactions: returns items array on ok, [] on non-ok, [] on throw",
  withFetch(
    async (_url, init) => {
      assert.ok(init?.signal instanceof AbortSignal);
      return okJson({ items: [{ hash: "0xabc" }] });
    },
    async () => {
      const txs = await fetchWalletTransactions(ADDR);
      assert.equal(txs.length, 1);
      assert.equal(txs[0].hash, "0xabc");
    }
  )
);

test(
  "fetchWalletTransactions: non-ok -> []",
  withFetch(
    async () => notOk(),
    async () => assert.deepEqual(await fetchWalletTransactions(ADDR), [])
  )
);

test(
  "fetchWalletTransactions: thrown fetch -> []",
  withFetch(
    async () => {
      throw new Error("boom");
    },
    async () => assert.deepEqual(await fetchWalletTransactions(ADDR), [])
  )
);

// --- fetchWalletTokens -----------------------------------------------------

test(
  "fetchWalletTokens: caps results at 15 and passes an AbortSignal",
  withFetch(
    async (_url, init) => {
      assert.ok(init?.signal instanceof AbortSignal);
      const many = Array.from({ length: 40 }, (_, i) => ({ token: { symbol: `T${i}` }, value: "1" }));
      return okJson(many);
    },
    async () => {
      const tokens = await fetchWalletTokens(ADDR);
      assert.equal(tokens.length, 15);
    }
  )
);

test(
  "fetchWalletTokens: a non-array body is coerced to [] (defensive)",
  withFetch(
    async () => okJson({ unexpected: "shape" }),
    async () => assert.deepEqual(await fetchWalletTokens(ADDR), [])
  )
);

test(
  "fetchWalletTokens: thrown fetch -> []",
  withFetch(
    async () => {
      throw new Error("boom");
    },
    async () => assert.deepEqual(await fetchWalletTokens(ADDR), [])
  )
);
