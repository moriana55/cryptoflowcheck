import { cookies } from "next/headers";
import { isProSubscriber } from "@/lib/subscriptions";
import { resolveTier, TIER_EMAIL_COOKIE, type Tier } from "@/lib/tierLogic";

export { TIER_EMAIL_COOKIE, DAILY_AI_QUERY_LIMIT } from "@/lib/tierLogic";
export type { Tier } from "@/lib/tierLogic";

/**
 * Resolve the current request's tier from the session cookie + subscription
 * store. Reads cookies via next/headers, so call it from Server Components,
 * Server Actions or Route Handlers. The pure decision lives in resolveTier
 * (src/lib/tierLogic.ts) and is unit-tested there.
 */
export async function getRequestTier(): Promise<{ tier: Tier; email: string | null }> {
  let email: string | null = null;
  try {
    const store = await cookies();
    email = store.get(TIER_EMAIL_COOKIE)?.value ?? null;
  } catch {
    email = null;
  }
  return resolveTier(email, isProSubscriber);
}
