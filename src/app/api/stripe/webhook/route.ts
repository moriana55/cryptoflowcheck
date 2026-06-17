import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
  upsertSubscription,
  getSubscriptionByCustomerId,
  type SubscriptionStatus,
} from "@/lib/subscriptions";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  // Fail-closed: without keys we cannot verify authenticity, so reject
  // rather than processing forged events or crashing on a missing secret.
  if (!webhookSecret || !stripeKey) {
    console.warn("[Stripe] Webhook called but Stripe env not configured — rejecting.");
    return NextResponse.json(
      { error: "Stripe is not configured on this server." },
      { status: 503 }
    );
  }

  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid signature";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email || session.customer_details?.email || null;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (email) {
          upsertSubscription({
            email,
            customerId,
            subscriptionId,
            status: "active",
          });
          console.log(`[Stripe] Pro activated for ${email}`);
        } else {
          console.warn("[Stripe] checkout.session.completed without email");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        const existing = getSubscriptionByCustomerId(customerId);
        // Prefer the email we already have; fall back to fetching the customer.
        let email = existing?.email;
        if (!email) {
          try {
            const customer = await getStripe().customers.retrieve(customerId);
            if (!("deleted" in customer) || !customer.deleted) {
              email = (customer as Stripe.Customer).email ?? undefined;
            }
          } catch {
            // ignore — handled below
          }
        }

        if (email) {
          const periodEnd = (subscription as unknown as { current_period_end?: number })
            .current_period_end;
          upsertSubscription({
            email,
            customerId,
            subscriptionId: subscription.id,
            status: subscription.status as SubscriptionStatus,
            currentPeriodEnd: periodEnd,
          });
          console.log(`[Stripe] Subscription ${subscription.status} for ${email}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id;
        const existing = getSubscriptionByCustomerId(customerId);
        if (existing) {
          upsertSubscription({
            email: existing.email,
            customerId,
            subscriptionId: subscription.id,
            status: "canceled",
          });
          console.log(`[Stripe] Subscription canceled for ${existing.email}`);
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }
  } catch (err) {
    console.error("[Stripe] Handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
