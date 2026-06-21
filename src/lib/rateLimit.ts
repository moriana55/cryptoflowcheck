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

/** Strict-ish IPv4 / IPv6 shape check so a spoofed header can't inject an
 *  arbitrary string (or a wildcard) into a rate-limit key. */
function isValidIP(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  // IPv4
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    return ip.split(".").every((o) => Number(o) <= 255);
  }
  // IPv6 (loose but bounded: only hex groups + colons, must contain a colon)
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":");
}

/**
 * Resolve the client IP used for rate-limit keys.
 *
 * The raw `x-forwarded-for` header is client-controlled and trivially spoofable,
 * which would let an attacker forge a fresh IP per request and bypass limits.
 * On Vercel (this app's host) the platform sets `x-real-ip` from the actual TCP
 * connection — that is the trustworthy source — and appends the real client IP
 * as the LAST entry of `x-forwarded-for`. We therefore:
 *   1. Prefer `x-real-ip` (platform-set, not spoofable via request body).
 *   2. Fall back to the last `x-forwarded-for` entry (Vercel-appended real IP),
 *      not the first (which a client can prepend).
 * Every candidate is validated as a real IP shape before use; anything else
 * collapses to "unknown" so forged garbage can't fragment the key space.
 */
export function getClientIP(req: Request): string {
  const realIP = req.headers.get("x-real-ip")?.trim();
  if (realIP && isValidIP(realIP)) return realIP;

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    // Last entry is the one appended by the trusted proxy (Vercel); the leading
    // entries can be forged by the client.
    const candidate = parts[parts.length - 1];
    if (candidate && isValidIP(candidate)) return candidate;
  }

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
