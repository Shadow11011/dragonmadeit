import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCheckoutUrl } from "@/lib/gumroad";
import { z } from "zod";

const schema = z.object({
  tier: z.enum(["HATCHLING", "DRAKE", "ELDER_DRAGON"]),
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

    const url = getCheckoutUrl(parsed.data.tier, session.user.email);

    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error("POST /api/gumroad/checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout" },
      { status: 500 }
    );
  }
}
