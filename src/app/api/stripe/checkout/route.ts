import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateCustomer, createCheckoutSession, PRICE_IDS } from "@/lib/stripe";
import { Tier } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tier } = await request.json();

    if (!tier || !(tier in PRICE_IDS)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const customerId = await getOrCreateCustomer(session.user.id, session.user.email!);
    const priceId = PRICE_IDS[tier as Exclude<Tier, "FREE">];
    const url = await createCheckoutSession(customerId, priceId, session.user.id);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
