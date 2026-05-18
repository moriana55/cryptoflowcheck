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
