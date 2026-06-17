import { cookies } from "next/headers";
import { isProSubscriber } from "@/lib/subscriptions";

export type Tier = "free" | "pro";

/**
 * Name of the cookie holding the visitor's email once they have subscribed.
 * Set client-side after a successful checkout return, or server-side anywhere
 * the email becomes known. Tier is always re-derived from the persisted
 * subscription store, never trusted from the cookie itself.
 */
export const TIER_EMAIL_COOKIE = "cfc-user-email";

/**
 * Resolve the current request's tier from the session cookie + subscription
 * store. Reads cookies via next/headers, so call it from Server Components,
 * Server Actions or Route Handlers.
 */
export async function getRequestTier(): Promise<{ tier: Tier; email: string | null }> {
  let email: string | null = null;
  try {
    const store = await cookies();
    email = store.get(TIER_EMAIL_COOKIE)?.value?.toLowerCase() || null;
  } catch {
    email = null;
  }
  const tier: Tier = isProSubscriber(email) ? "pro" : "free";
  return { tier, email };
}

/** Daily AI query allowance per tier. -1 means unlimited. */
export const DAILY_AI_QUERY_LIMIT: Record<Tier, number> = {
  free: 5,
  pro: -1,
};
