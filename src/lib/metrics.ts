/**
 * Lightweight in-memory metrics aggregation.
 *
 * Read-only dashboards consume these counters. In-memory by default (resets on
 * cold start / per instance); the API is intentionally tiny so it can be backed
 * by Vercel KV / Redis later without touching call sites.
 */

interface DailyBucket {
  day: string; // YYYY-MM-DD UTC
  visitors: Set<string>; // hashed identifiers for a DAU proxy
  aiQueries: number;
  watchToggles: number;
}

const buckets = new Map<string, DailyBucket>();

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function bucket(day = utcDay()): DailyBucket {
  let b = buckets.get(day);
  if (!b) {
    b = { day, visitors: new Set(), aiQueries: 0, watchToggles: 0 };
    buckets.set(day, b);
  }
  return b;
}

/** Record a unique-ish visitor for the DAU proxy. `id` should be non-PII. */
export function recordVisit(id: string) {
  if (id) bucket().visitors.add(id);
}

export function recordAIQuery() {
  bucket().aiQueries += 1;
}

export function recordWatchToggle() {
  bucket().watchToggles += 1;
}

export interface MetricsSnapshot {
  generatedAt: string;
  today: { date: string; dauProxy: number; aiQueries: number; watchToggles: number };
  last7Days: { date: string; dauProxy: number; aiQueries: number }[];
}

export function getMetricsSnapshot(): MetricsSnapshot {
  const today = bucket();
  const last7Days: MetricsSnapshot["last7Days"] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const b = buckets.get(d);
    last7Days.push({
      date: d,
      dauProxy: b ? b.visitors.size : 0,
      aiQueries: b ? b.aiQueries : 0,
    });
  }
  return {
    generatedAt: new Date().toISOString(),
    today: {
      date: today.day,
      dauProxy: today.visitors.size,
      aiQueries: today.aiQueries,
      watchToggles: today.watchToggles,
    },
    last7Days,
  };
}
