import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getOrCreateCustomer,
  createCheckoutSession,
} from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  tier: z.enum(["HATCHLING", "DRAKE", "ELDER_DRAGON"]),
  schedule: z.object({
    days: z.array(z.number().min(0).max(6)),
    times: z.array(z.string().regex(/^\d{2}:\d{2}$/)),
    timezone: z.string().min(1),
  }),
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
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const { tier, schedule } = parsed.data;

    const customerId = await getOrCreateCustomer(
      session.user.id,
      session.user.email
    );

    const checkoutUrl = await createCheckoutSession({
      customerId,
      tier,
      userId: session.user.id,
      schedule,
    });

    return NextResponse.json({ success: true, data: { url: checkoutUrl } });
  } catch (error) {
    console.error("POST /api/stripe/checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
