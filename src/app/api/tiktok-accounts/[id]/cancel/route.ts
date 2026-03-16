import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const account = await prisma.tikTokAccount.findFirst({
      where: { id: params.id, userId: session.user.id },
      select: { id: true, stripeSubscriptionId: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    if (!account.stripeSubscriptionId) {
      return NextResponse.json(
        { success: false, error: "No active subscription to cancel" },
        { status: 400 }
      );
    }

    await stripe.subscriptions.cancel(account.stripeSubscriptionId);

    // Stripe webhook (customer.subscription.deleted) handles DB cleanup
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/tiktok-accounts/[id]/cancel error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to cancel subscription" },
      { status: 500 }
    );
  }
}
