import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetCodeEmail } from "@/lib/email";
import {
  generateCode,
  hashCode,
  CODE_EXPIRY_MS,
} from "@/lib/verification-code";

const schema = z.object({
  email: z.string().email("Invalid email address"),
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

    const { email } = result.data;

    // Always return 200 to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (user) {
      await prisma.emailVerificationCode.deleteMany({
        where: { email, type: "PASSWORD_RESET", usedAt: null },
      });

      const code = generateCode();

      await prisma.emailVerificationCode.create({
        data: {
          email,
          codeHash: hashCode(code),
          type: "PASSWORD_RESET",
          expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
        },
      });

      await sendPasswordResetCodeEmail({ to: email, code });
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, a code has been sent.",
    });
  } catch (error) {
    console.error("Send reset code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
