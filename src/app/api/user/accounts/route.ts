import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        tier: true,
        videosPerWeek: true,
        schedule: true,
        scheduleLocked: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const data = accounts.map((account) => ({
      ...account,
      isLinked: !account.username.startsWith("pending-"),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/user/accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// TikTok accounts are now created via Stripe checkout (payment-gated).
// Direct account creation is no longer supported.
// Use POST /api/stripe/checkout to purchase a new account slot.

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.tikTokAccount.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, stripeSubscriptionId: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Prevent deletion of accounts with active subscriptions
    // User must cancel the subscription first via the billing portal
    if (account.stripeSubscriptionId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot delete an account with an active subscription. Cancel the subscription first.",
        },
        { status: 409 }
      );
    }

    await prisma.tikTokAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { deleted: id } });
  } catch (error) {
    console.error("DELETE /api/user/accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
