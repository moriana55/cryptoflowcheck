export type Tier = "free" | "pro";

/**
 * Name of the cookie holding the visitor's email once they have subscribed.
 * The cookie carries ONLY an email identity hint — the tier is always
 * re-derived from the persisted subscription store, never trusted from the
 * cookie itself.
 */
export const TIER_EMAIL_COOKIE = "cfc-user-email";

/**
 * Pure tier resolution. SECURITY CRITICAL.
 *
 * The cookie supplies only the email (a hint). Whether that identity is Pro is
 * ALWAYS decided by the injected subscription-store lookup, so a forged
 * `pro=true`-style cookie can never grant Pro.
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
