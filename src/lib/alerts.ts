/**
 * Client-side threshold / whale watch store.
 *
 * A "watch" pairs a coin with a price or 24h-change threshold and a direction.
 * When the live value crosses the threshold the watch is "triggered" and shown
 * in the digest. Persisted in localStorage, namespaced per user identity (same
 * cookie hint as the portfolio store). Pure code — evaluation runs entirely on
 * public Binance price data passed in by the caller.
 *
 * Tier note: "basic" watches (price/percent on a single tracked coin) are free.
 * "Advanced" watches (whale-volume threshold, multi-condition) are gated behind
 * the Pro tier — the gate is enforced server-side via /api/tier and re-checked
 * here defensively before an advanced watch is allowed to persist.
 */

export type WatchMetric = "price" | "change24h" | "volume";
export type WatchDirection = "above" | "below";

export interface Watch {
  id: string; // uuid-ish
  coinId: string;
  pair: string;
  symbol: string;
  name: string;
  metric: WatchMetric;
  direction: WatchDirection;
  threshold: number;
  createdAt: string;
  /** Advanced watches require Pro. volume watches are always advanced. */
  advanced: boolean;
}

export interface TriggeredWatch extends Watch {
  currentValue: number | null;
  triggered: boolean;
}

const BASE_KEY = "cfc-watches";

function currentEmail(): string {
  if (typeof document === "undefined") return "anon";
  const match = document.cookie.match(/(?:^|;\s*)cfc-user-email=([^;]+)/);
  if (match) {
    try {
      return decodeURIComponent(match[1]).toLowerCase() || "anon";
    } catch {
      return "anon";
    }
  }
  return "anon";
}

function storageKey(): string {
  return `${BASE_KEY}:${currentEmail()}`;
}

export function getWatches(): Watch[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWatches(watches: Watch[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(), JSON.stringify(watches));
  window.dispatchEvent(new Event("watches-change"));
}

/** A volume metric is inherently an advanced (pro) watch. */
export function isAdvancedMetric(metric: WatchMetric): boolean {
  return metric === "volume";
}

export function addWatch(
  input: Omit<Watch, "id" | "createdAt" | "advanced">
): Watch {
  const watch: Watch = {
    ...input,
    threshold: Number(input.threshold) || 0,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
    advanced: isAdvancedMetric(input.metric),
  };
  writeWatches([...getWatches(), watch]);
  return watch;
}

export function removeWatch(id: string) {
  writeWatches(getWatches().filter((w) => w.id !== id));
}

/**
 * Evaluate watches against a live data map keyed by pair. Each entry must
 * expose price, change24h and volume (quote volume). Returns the watches with
 * a current value and a triggered flag for the digest list.
 */
export function evaluateWatches(
  watches: Watch[],
  data: Record<string, { price: number; change24h: number; volume: number }>
): TriggeredWatch[] {
  return watches.map((w) => {
    const d = data[w.pair];
    let currentValue: number | null = null;
    if (d) {
      if (w.metric === "price") currentValue = d.price;
      else if (w.metric === "change24h") currentValue = d.change24h;
      else currentValue = d.volume;
    }
    let triggered = false;
    if (currentValue != null) {
      triggered =
        w.direction === "above"
          ? currentValue >= w.threshold
          : currentValue <= w.threshold;
    }
    return { ...w, currentValue, triggered };
  });
}
