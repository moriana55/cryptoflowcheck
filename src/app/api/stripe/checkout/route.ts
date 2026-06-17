import { NextRequest, NextResponse } from "next/server";
import { getStripe, PLANS, isStripeConfigured } from "@/lib/stripe";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not enabled on this server yet." },
      { status: 503 }
    );
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: PLANS.pro.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cryptoflowcheck.com"}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://cryptoflowcheck.com"}/pricing?canceled=true`,
      metadata: {
        plan: "pro",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
