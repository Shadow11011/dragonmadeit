import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PAYSTACK_PLAN_CODES, initializeTransaction } from "@/lib/paystack";
import { z } from "zod";

const schema = z.object({
  tier: z.enum(["HATCHLING", "DRAKE", "ELDER_DRAGON"]),
  billingInterval: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { tier, billingInterval } = parsed.data;
    const planCode = PAYSTACK_PLAN_CODES[tier][billingInterval];

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://dragonmadeit.app";

    const result = await initializeTransaction({
      email: session.user.email,
      plan: planCode,
      callbackUrl: `${baseUrl}/dashboard/accounts?checkout=success`,
      metadata: {
        userId: session.user.id,
        tier,
        billingInterval,
      },
    });

    return NextResponse.json({
      success: true,
      data: { authorization_url: result.authorization_url },
    });
  } catch (error) {
    console.error("POST /api/paystack/initialize error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
