import { NextRequest, NextResponse } from "next/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { upsertSubscription } from "@/lib/subscriptions";
import { issueSubscriptionIdentity } from "@/lib/subscriptionIdentity";
import { TIER_EMAIL_COOKIE } from "@/lib/tierLogic";
import { getClientIP, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isStripeConfigured() || !process.env.SUBSCRIPTION_COOKIE_SECRET) {
    return NextResponse.json({ error: "Subscription verification is not configured." }, { status: 503 });
  }

  const limit = rateLimit(`stripe-session:${getClientIP(request)}`, 10, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId?.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email || session.customer_email;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;

    if (session.status !== "complete" || !email || !subscriptionId) {
      return NextResponse.json({ error: "Checkout is not complete." }, { status: 409 });
    }

    upsertSubscription({
      email,
      customerId,
      subscriptionId,
      status: "active",
    });
    const token = await issueSubscriptionIdentity(email);
    if (!token) {
      return NextResponse.json({ error: "Subscription identity is not configured." }, { status: 503 });
    }

    const response = NextResponse.json({ verified: true });
    response.cookies.set(TIER_EMAIL_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Checkout verification failed." }, { status: 400 });
  }
}
