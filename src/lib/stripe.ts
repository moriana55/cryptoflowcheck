import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    // Fail-closed: never construct a client with an undefined key.
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!_stripe) {
    _stripe = new Stripe(key, {
      apiVersion: "2026-04-22.dahlia",
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    aiQueries: 3,
    features: ["3 AI queries/day", "Basic market data", "Top 40 coins"],
  },
  pro: {
    name: "Pro",
    price: 9.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    aiQueries: -1,
    features: [
      "Unlimited AI analysis",
      "Whale alert notifications",
      "Portfolio tracking",
      "Priority data refresh",
      "Custom coin alerts",
      "Export reports",
    ],
  },
} as const;
