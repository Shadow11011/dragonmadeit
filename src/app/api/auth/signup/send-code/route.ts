import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationCodeEmail } from "@/lib/email";
import {
  generateCode,
  hashCode,
  CODE_EXPIRY_MS,
} from "@/lib/verification-code";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
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

    const { email, password, name } = result.data;

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

    const hashedPassword = await bcrypt.hash(password, 10);

    // Delete any old unused signup codes for this email
    await prisma.emailVerificationCode.deleteMany({
      where: { email, type: "SIGNUP", usedAt: null },
    });

    const code = generateCode();

    await prisma.emailVerificationCode.create({
      data: {
        email,
        codeHash: hashCode(code),
        type: "SIGNUP",
        expiresAt: new Date(Date.now() + CODE_EXPIRY_MS),
        pendingName: name || null,
        pendingPasswordHash: hashedPassword,
      },
    });

    await sendVerificationCodeEmail({ to: email, code });

    return NextResponse.json({ message: "Verification code sent" });
  } catch (error) {
    console.error("Send signup code error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
