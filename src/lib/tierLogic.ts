export type Tier = "free" | "pro";

/**
 * Name of the HTTP-only, HMAC-signed subscription identity cookie.
 */
export const TIER_EMAIL_COOKIE = "cfc-user-email";

/**
 * Pure tier resolution. SECURITY CRITICAL.
 *
 * The caller verifies the signed identity token before passing the email here.
 * Whether that verified identity is Pro is still decided by the subscription
 * store, so identity and entitlement are independent checks.
 *
 * `email` is the raw cookie value (or null). `isProInStore` is the store lookup
 * (e.g. isProSubscriber) injected so this stays free of fs/next dependencies.
 */
export function resolveTier(
  email: string | null | undefined,
  isProInStore: (email: string | null) => boolean
): { tier: Tier; email: string | null } {
  const normalized = (email ?? "").toLowerCase() || null;
  const tier: Tier = isProInStore(normalized) ? "pro" : "free";
  return { tier, email: normalized };
}

/** Daily AI query allowance per tier. -1 means unlimited. */
export const DAILY_AI_QUERY_LIMIT: Record<Tier, number> = {
  free: 5,
  pro: -1,
};
