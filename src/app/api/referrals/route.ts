import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildReferralUrl,
  formatCreditsDisplay,
  generateUniqueReferralCode,
} from "@/lib/referral";

/**
 * GET /api/referrals
 *
 * Returns the current user's referral dashboard data:
 *   - referralCode
 *   - referralUrl (full shareable link)
 *   - referredCount (how many signups used their code)
 *   - creditsEarnedCents (raw balance in cents)
 *   - creditsEarnedDisplay (formatted "$X.XX")
 *
 * Auth: NextAuth session required. 401 otherwise.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, referralCredits: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Self-heal: if for some reason this user lacks a referralCode (shouldn't
    // happen post-migration, but belt-and-braces), assign one now.
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = await generateUniqueReferralCode();
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode },
      });
    }

    const referredCount = await prisma.user.count({
      where: { referredByUserId: userId },
    });

    const creditsEarnedCents = user.referralCredits;

    return NextResponse.json({
      referralCode,
      referralUrl: buildReferralUrl(referralCode),
      referredCount,
      creditsEarnedCents,
      creditsEarnedDisplay: formatCreditsDisplay(creditsEarnedCents),
    });
  } catch (error) {
    console.error("GET /api/referrals error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
