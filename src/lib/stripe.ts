import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
