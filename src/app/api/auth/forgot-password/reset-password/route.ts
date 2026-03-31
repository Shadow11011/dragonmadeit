import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  resetToken: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

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

    const { resetToken, newPassword } = result.data;

    let email: string;
    try {
      const { payload } = await jwtVerify(resetToken, getSecret());
      if (payload.type !== "password-reset" || typeof payload.email !== "string") {
        return NextResponse.json(
          { error: "Invalid reset token" },
          { status: 400 }
        );
      }
      email = payload.email;
    } catch {
      return NextResponse.json(
        { error: "Reset token expired or invalid. Please start over." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Account not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
