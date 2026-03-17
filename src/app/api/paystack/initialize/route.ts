import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateCustomer, initializeTransaction } from "@/lib/paystack";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["HATCHLING", "DRAKE", "ELDER_DRAGON"]),
  billingInterval: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]).default("MONTHLY"),
  schedule: z.object({
    days: z.array(z.number()),
    times: z.array(z.string()).min(1),
    timezone: z.string(),
  }),
  contentConfig: z.object({
    videoType: z.enum(["GAMEPLAY", "AI_IMAGES"]),
    voiceType: z.enum(["MALE", "FEMALE", "RANDOM"]),
    storyTypes: z.array(z.string()).max(5),
    randomizeStories: z.boolean(),
  }).optional(),
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
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { tier, billingInterval, schedule, contentConfig } = parsed.data;

    await getOrCreateCustomer(session.user.id, session.user.email);

    const result = await initializeTransaction({
      customerEmail: session.user.email,
      tier,
      billingInterval,
      userId: session.user.id,
      schedule,
      contentConfig,
    });

    return NextResponse.json({
      success: true,
      data: { url: result.authorizationUrl },
    });
  } catch (error) {
    console.error("POST /api/paystack/initialize error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
