import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cancelSubscription } from "@/lib/gumroad";
import { disconnectAccount, deleteProfile } from "@/lib/late-api";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        gumroadCustomerId: true,
        onboardingComplete: true,
        tiktokAccounts: {
          select: {
            id: true,
            username: true,
            tier: true,
            videosPerWeek: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email } = parsed.data;

    // Check if email is taken by another user
    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        gumroadCustomerId: true,
        onboardingComplete: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("PATCH /api/user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        gumroadCustomerId: true,
        tiktokAccounts: {
          select: {
            id: true,
            gumroadSubscriptionId: true,
            lateAccountId: true,
            lateProfileId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Clean up each TikTok account: cancel subscription, disconnect Late.dev
    for (const account of user.tiktokAccounts) {
      if (account.gumroadSubscriptionId) {
        try {
          await cancelSubscription(account.gumroadSubscriptionId);
        } catch (err) {
          console.error(`Failed to cancel Gumroad subscription ${account.gumroadSubscriptionId}:`, err);
        }
      }

      if (account.lateAccountId) {
        try {
          await disconnectAccount(account.lateAccountId);
        } catch (err) {
          console.error(`Failed to disconnect Late.dev account ${account.lateAccountId}:`, err);
        }
      }

      if (account.lateProfileId) {
        try {
          await deleteProfile(account.lateProfileId);
        } catch (err) {
          console.error(`Failed to delete Late.dev profile ${account.lateProfileId}:`, err);
        }
      }
    }

    // Delete user — cascades to TikTokAccounts, sessions, etc.
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
