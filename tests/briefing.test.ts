import test from "node:test";
import assert from "node:assert/strict";
import {
  buildBriefingPrompt,
  fallbackBriefing,
  parseBriefingResponse,
  type MarketSnapshot,
} from "../src/lib/briefing.ts";

// ---------------------------------------------------------------------------
// Daily Market Briefing — pure logic (src/lib/briefing.ts).
//
// Covers the production decisions the AI briefing depends on: the deterministic
// fallback (used whenever OpenAI is unconfigured/failing or data is missing),
// the model-response parser (tolerant of code fences / malformed JSON), and the
// Pro-personalization weighting. No network / openai touched.
// ---------------------------------------------------------------------------

const NOW = "2026-06-29T12:00:00.000Z";

function snapshot(overrides: Partial<MarketSnapshot> = {}): MarketSnapshot {
  return {
    day: "2026-06-29",
    coins: [
      { symbol: "BTC", price: 65000, change24h: 2.5, volumeUSD: 30e9 },
      { symbol: "ETH", price: 3400, change24h: -1.2, volumeUSD: 15e9 },
      { symbol: "SOL", price: 150, change24h: 8.1, volumeUSD: 4e9 },
      { symbol: "DOGE", price: 0.12, change24h: -6.4, volumeUSD: 1e9 },
    ],
    fearGreed: { value: 72, classification: "Greed" },
    totalVolumeUSD: 50e9,
    ...overrides,
  };
}

// --- fallbackBriefing ------------------------------------------------------

test("fallback: with data -> deterministic summary + 3 bullets, source=fallback", () => {
  const b = fallbackBriefing(snapshot(), NOW);
  assert.equal(b.source, "fallback");
  assert.equal(b.day, "2026-06-29");
  assert.equal(b.generatedAt, NOW);
  assert.equal(b.bullets.length, 3);
  // Anchored on BTC and references a percent figure.
  assert.match(b.summary, /BTC/);
  assert.match(b.summary, /%/);
});

test("fallback: identifies the real top gainer and loser", () => {
  const b = fallbackBriefing(snapshot(), NOW);
  // SOL (+8.1) is the gainer, DOGE (-6.4) the loser.
  assert.match(b.summary, /SOL leads/);
  assert.match(b.summary, /DOGE lags/);
});

test("fallback: empty coins -> graceful 'unavailable' briefing, never throws", () => {
  const b = fallbackBriefing(snapshot({ coins: [], fearGreed: null, totalVolumeUSD: 0 }), NOW);
  assert.equal(b.source, "fallback");
  assert.match(b.summary, /unavailable/i);
  assert.ok(b.bullets.length >= 1);
});

test("fallback: missing Fear & Greed still produces a valid briefing", () => {
  const b = fallbackBriefing(snapshot({ fearGreed: null }), NOW);
  assert.equal(b.source, "fallback");
  assert.match(b.summary, /mixed/);
  assert.equal(b.bullets.length, 3);
});

test("fallback PRO: a tracked focus coin is surfaced as the lead bullet", () => {
  const b = fallbackBriefing(snapshot(), NOW, ["sol"]);
  assert.ok(b.bullets.length <= 4);
  assert.match(b.bullets[0], /tracking SOL/i);
});

test("fallback PRO: a focus symbol we don't cover is ignored (no crash)", () => {
  const b = fallbackBriefing(snapshot(), NOW, ["PEPE"]);
  assert.equal(b.source, "fallback");
  // No focus lead bullet, so it stays at the standard 3.
  assert.equal(b.bullets.length, 3);
});

// --- parseBriefingResponse -------------------------------------------------

test("parse: clean JSON -> source=ai with trimmed bullets", () => {
  const raw = JSON.stringify({
    summary: "  Markets are calm today.  ",
    bullets: ["  BTC steady  ", "ETH soft", "", "  SOL strong  "],
  });
  const b = parseBriefingResponse(raw, snapshot(), NOW);
  assert.equal(b.source, "ai");
  assert.equal(b.summary, "Markets are calm today.");
  assert.deepEqual(b.bullets, ["BTC steady", "ETH soft", "SOL strong"]);
  assert.equal(b.day, "2026-06-29");
});

test("parse: JSON wrapped in ```json code fences is still parsed", () => {
  const raw = "```json\n" + JSON.stringify({ summary: "Hello", bullets: ["a", "b"] }) + "\n```";
  const b = parseBriefingResponse(raw, snapshot(), NOW);
  assert.equal(b.source, "ai");
  assert.equal(b.summary, "Hello");
  assert.deepEqual(b.bullets, ["a", "b"]);
});

test("parse: caps bullets at 4", () => {
  const raw = JSON.stringify({ summary: "s", bullets: ["1", "2", "3", "4", "5", "6"] });
  const b = parseBriefingResponse(raw, snapshot(), NOW);
  assert.equal(b.bullets.length, 4);
});

test("parse: malformed JSON -> falls back to deterministic briefing", () => {
  const b = parseBriefingResponse("not json at all {", snapshot(), NOW);
  assert.equal(b.source, "fallback");
  assert.equal(b.bullets.length, 3);
});

test("parse: valid JSON but empty summary -> fallback", () => {
  const raw = JSON.stringify({ summary: "   ", bullets: ["a"] });
  const b = parseBriefingResponse(raw, snapshot(), NOW);
  assert.equal(b.source, "fallback");
});

test("parse: valid JSON but no usable bullets -> fallback", () => {
  const raw = JSON.stringify({ summary: "ok", bullets: [1, 2, null] });
  const b = parseBriefingResponse(raw, snapshot(), NOW);
  assert.equal(b.source, "fallback");
});

// --- buildBriefingPrompt ---------------------------------------------------

test("prompt: includes live numbers, the JSON contract, and the day", () => {
  const p = buildBriefingPrompt(snapshot());
  assert.match(p, /BTC/);
  assert.match(p, /Fear & Greed/);
  assert.match(p, /2026-06-29/);
  assert.match(p, /JSON/);
});

test("prompt: focus symbols add a weighting hint", () => {
  const p = buildBriefingPrompt(snapshot(), ["SOL", "ETH"]);
  assert.match(p, /especially tracking/i);
  assert.match(p, /SOL, ETH/);
});

test("prompt: no focus -> no tracking hint", () => {
  const p = buildBriefingPrompt(snapshot(), []);
  assert.doesNotMatch(p, /especially tracking/i);
});
