interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests = 30,
  windowMs = 60000
) {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetTime) {
    store.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, limit: maxRequests, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, limit: maxRequests, remaining: 0 };
  }

  entry.count++;
  return { success: true, limit: maxRequests, remaining: maxRequests - entry.count };
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

interface DailyCounter {
  count: number;
  day: string; // YYYY-MM-DD (UTC)
}

const dailyStore = new Map<string, DailyCounter>();

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Per-identifier daily quota. `max < 0` means unlimited (always allowed).
 * Counters reset at UTC midnight. In-memory by default; swap `dailyStore`
 * for Vercel KV/Redis to make it durable across instances.
 */
export function consumeDailyQuota(
  identifier: string,
  max: number
): { success: boolean; limit: number; remaining: number; used: number } {
  if (max < 0) {
    return { success: true, limit: -1, remaining: -1, used: 0 };
  }

  const day = utcDay();
  const entry = dailyStore.get(identifier);

  if (!entry || entry.day !== day) {
    dailyStore.set(identifier, { count: 1, day });
    return { success: true, limit: max, remaining: max - 1, used: 1 };
  }

  if (entry.count >= max) {
    return { success: false, limit: max, remaining: 0, used: entry.count };
  }

  entry.count++;
  return {
    success: true,
    limit: max,
    remaining: max - entry.count,
    used: entry.count,
  };
}

/** Read-only peek at how many quota units an identifier has used today. */
export function peekDailyUsage(identifier: string): number {
  const entry = dailyStore.get(identifier);
  if (!entry || entry.day !== utcDay()) return 0;
  return entry.count;
}
