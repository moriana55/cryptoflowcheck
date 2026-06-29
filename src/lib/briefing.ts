/**
 * Daily Market Briefing — pure logic.
 *
 * This module holds the dependency-free building blocks for the once-per-day
 * AI market briefing: the data shape, the prompt builder, a deterministic
 * fallback (used when OpenAI is unconfigured/failing or live data is missing),
 * and the AI-response parser. It imports nothing (no openai / next), so it can
 * be unit-tested directly — same pattern as tierLogic.ts and csv.ts.
 *
 * The server glue (fetching the live snapshot, calling OpenAI, daily caching)
 * lives in src/lib/ai.ts which consumes these helpers.
 */

export interface MarketSnapshotCoin {
  /** Bare symbol, e.g. "BTC". */
  symbol: string;
  price: number;
  /** 24h percent change. */
  change24h: number;
  /** 24h quote (USD) volume. */
  volumeUSD: number;
}

export interface MarketSnapshot {
  /** UTC day (YYYY-MM-DD) the snapshot belongs to. */
  day: string;
  coins: MarketSnapshotCoin[];
  fearGreed: { value: number; classification: string } | null;
  totalVolumeUSD: number;
}

export interface DailyBriefing {
  day: string;
  summary: string;
  bullets: string[];
  /** ISO timestamp the briefing was produced. */
  generatedAt: string;
  /** "ai" when authored by the model, "fallback" for the deterministic version. */
  source: "ai" | "fallback";
}

const MAX_BULLETS = 4;

function fmtPrice(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1) return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return "$" + n.toPrecision(4);
}

function fmtPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function fmtBillions(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "—";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(1) + "B";
  return "$" + (n / 1e6).toFixed(0) + "M";
}

function findCoin(snapshot: MarketSnapshot, symbol: string): MarketSnapshotCoin | undefined {
  const target = symbol.toUpperCase();
  return snapshot.coins.find((c) => c.symbol.toUpperCase() === target);
}

function topGainer(coins: MarketSnapshotCoin[]): MarketSnapshotCoin | undefined {
  if (coins.length === 0) return undefined;
  return [...coins].sort((a, b) => b.change24h - a.change24h)[0];
}

function topLoser(coins: MarketSnapshotCoin[]): MarketSnapshotCoin | undefined {
  if (coins.length === 0) return undefined;
  return [...coins].sort((a, b) => a.change24h - b.change24h)[0];
}

/**
 * Render the snapshot as compact text for the model, plus the JSON contract it
 * must return. `focus` (a Pro user's tracked symbols) is woven in as a soft
 * weighting hint when present.
 */
export function buildBriefingPrompt(snapshot: MarketSnapshot, focus: string[] = []): string {
  const lines = snapshot.coins
    .map((c) => `${c.symbol}: ${fmtPrice(c.price)} (${fmtPct(c.change24h)}) vol ${fmtBillions(c.volumeUSD)}`)
    .join("\n");

  const fg = snapshot.fearGreed
    ? `${snapshot.fearGreed.value} (${snapshot.fearGreed.classification})`
    : "N/A";

  const focusLine =
    focus.length > 0
      ? `\nThe reader is especially tracking these assets: ${focus.join(", ")}. Where the data supports it, weight your commentary toward them.`
      : "";

  return `LIVE MARKET SNAPSHOT (${snapshot.day}):
${lines}
Fear & Greed: ${fg}
Top-10 tracked volume: ${fmtBillions(snapshot.totalVolumeUSD)}${focusLine}

Write today's market briefing for a crypto dashboard reader. Be specific and use the numbers above. Keep it tight and skimmable — no hype, no price predictions, no financial advice.

Return ONLY valid JSON (no markdown code fences):
{"summary":"2-3 sentence overview of what's happening in the market today","bullets":["concise takeaway 1","concise takeaway 2","concise takeaway 3"]}`;
}

export const BRIEFING_SYSTEM_PROMPT =
  "You are the market desk at CryptoFlowCheck, a crypto intelligence dashboard. You write a concise, factual daily briefing grounded ONLY in the live numbers provided. Neutral, professional tone. No price targets, no financial advice, no hype. Always respond with the requested JSON object and nothing else.";

/**
 * Deterministic briefing built straight from the snapshot — no model needed.
 * Used when OpenAI is unconfigured, the call fails, or live data is missing, so
 * the briefing card always renders something truthful.
 */
export function fallbackBriefing(
  snapshot: MarketSnapshot,
  now: string,
  focus: string[] = []
): DailyBriefing {
  if (snapshot.coins.length === 0) {
    return {
      day: snapshot.day,
      summary:
        "Live market data is temporarily unavailable. Please check back shortly for today's briefing.",
      bullets: [
        "Our market feed did not return data for this update.",
        "Prices, volume and sentiment will refresh automatically when the feed recovers.",
      ],
      generatedAt: now,
      source: "fallback",
    };
  }

  const btc = findCoin(snapshot, "BTC") ?? snapshot.coins[0];
  const eth = findCoin(snapshot, "ETH");
  const gainer = topGainer(snapshot.coins)!;
  const loser = topLoser(snapshot.coins)!;
  const fg = snapshot.fearGreed;

  const btcDir = btc.change24h >= 0 ? "up" : "down";
  const sentiment = fg ? `${fg.classification.toLowerCase()} (${fg.value}/100)` : "mixed";

  const summary =
    `${btc.symbol} is ${btcDir} ${fmtPct(btc.change24h)} over the last 24 hours at ${fmtPrice(btc.price)}, ` +
    `with market sentiment in ${sentiment} territory. ` +
    `${gainer.symbol} leads the tracked set (${fmtPct(gainer.change24h)}) while ${loser.symbol} lags (${fmtPct(loser.change24h)}).`;

  const bullets: string[] = [];

  // Lead with a focus asset if a Pro reader is tracking one we cover.
  const focused = focus
    .map((s) => findCoin(snapshot, s))
    .find((c): c is MarketSnapshotCoin => Boolean(c));
  if (focused && focused.symbol.toUpperCase() !== btc.symbol.toUpperCase()) {
    bullets.push(
      `You're tracking ${focused.symbol}: ${fmtPrice(focused.price)}, ${fmtPct(focused.change24h)} over 24h.`
    );
  }

  bullets.push(
    eth
      ? `Majors: ${btc.symbol} ${fmtPrice(btc.price)} (${fmtPct(btc.change24h)}), ${eth.symbol} ${fmtPrice(eth.price)} (${fmtPct(eth.change24h)}).`
      : `${btc.symbol} trading at ${fmtPrice(btc.price)} (${fmtPct(btc.change24h)} 24h).`
  );
  bullets.push(
    `Biggest 24h mover: ${gainer.symbol} ${fmtPct(gainer.change24h)}; weakest: ${loser.symbol} ${fmtPct(loser.change24h)}.`
  );
  bullets.push(
    fg
      ? `Fear & Greed at ${fg.value} (${fg.classification}); top-10 tracked volume ${fmtBillions(snapshot.totalVolumeUSD)}.`
      : `Top-10 tracked 24h volume: ${fmtBillions(snapshot.totalVolumeUSD)}.`
  );

  return {
    day: snapshot.day,
    summary,
    bullets: bullets.slice(0, MAX_BULLETS),
    generatedAt: now,
    source: "fallback",
  };
}

/**
 * Parse the model's JSON reply into a DailyBriefing. Strips accidental code
 * fences, validates the shape, and falls back to the deterministic briefing on
 * any malformed/empty response so the caller never has to handle a throw.
 */
export function parseBriefingResponse(
  raw: string,
  snapshot: MarketSnapshot,
  now: string,
  focus: string[] = []
): DailyBriefing {
  try {
    const clean = raw
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);

    const summary = typeof parsed?.summary === "string" ? parsed.summary.trim() : "";
    const bullets = Array.isArray(parsed?.bullets)
      ? parsed.bullets
          .filter((b: unknown): b is string => typeof b === "string")
          .map((b: string) => b.trim())
          .filter(Boolean)
          .slice(0, MAX_BULLETS)
      : [];

    if (!summary || bullets.length === 0) {
      return fallbackBriefing(snapshot, now, focus);
    }

    return { day: snapshot.day, summary, bullets, generatedAt: now, source: "ai" };
  } catch {
    return fallbackBriefing(snapshot, now, focus);
  }
}
