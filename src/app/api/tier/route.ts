import { NextResponse } from "next/server";
import { getRequestTier } from "@/lib/tier";

export const dynamic = "force-dynamic";

/**
 * Server-side tier resolution for client components that need to gate pro-only
 * UI. The tier is ALWAYS re-derived from the persisted subscription store via
 * getRequestTier() — the email cookie is only an identity hint and is never
 * trusted as proof of payment. Returns the email so the client can show "logged
 * in as" context, but pro access is decided here, not on the client.
 */
export async function GET() {
  const { tier, email } = await getRequestTier();
  return NextResponse.json({ tier, email, isPro: tier === "pro" });
}
