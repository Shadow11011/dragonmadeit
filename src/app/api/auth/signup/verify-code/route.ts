import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { hashCode, MAX_ATTEMPTS } from "@/lib/verification-code";
import { generateUniqueReferralCode } from "@/lib/referral";

const schema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, code } = result.data;

    const record = await prisma.emailVerificationCode.findFirst({
      where: { email, type: "SIGNUP", usedAt: null },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return NextResponse.json(
        { error: "No pending verification. Please sign up again." },
        { status: 400 }
      );
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Too many attempts. Please request a new code." },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Code expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (hashCode(code) !== record.codeHash) {
      await prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json(
        { error: "Invalid code. Please try again." },
        { status: 400 }
      );
    }

    // Race condition guard
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Every user owns a unique referral code from day one.
    const referralCode = await generateUniqueReferralCode();

    // Create user and mark code as used
    const [user] = await Promise.all([
      prisma.user.create({
        data: {
          email,
          hashedPassword: record.pendingPasswordHash,
          name: record.pendingName,
          emailVerified: new Date(),
          referralCode,
        },
      }),
      prisma.emailVerificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    sendWelcomeEmail({ to: email, name: record.pendingName });

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error("Verify signup code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
