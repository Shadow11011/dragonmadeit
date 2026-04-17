import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPostFailedEmail } from "@/lib/email";

interface ZernioPostPayload {
  id: string;
  event: string;
  post: { id: string; content?: string; status?: string };
  timestamp: string;
}

interface ZernioAccountPayload {
  id: string;
  event: string;
  account: {
    accountId: string;
    profileId?: string;
    platform?: string;
    username?: string;
  };
  timestamp: string;
}

function truncateForDb(value: string | undefined | null, maxChars: number): string {
  if (!value) return "";
  const graphemes = Array.from(value);
  if (graphemes.length <= maxChars) return value;
  return graphemes.slice(0, maxChars).join("");
}

function extractAccountId(body: unknown): string | null {
  const b = body as {
    post?: { platforms?: Array<{ accountId?: string | { _id?: string } }> };
    account?: { accountId?: string };
  };
  const acctObj = b.post?.platforms?.[0]?.accountId;
  if (typeof acctObj === "string") return acctObj;
  if (acctObj && typeof acctObj === "object" && acctObj._id) return acctObj._id;
  return b.account?.accountId ?? null;
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get("x-zernio-signature") ??
      request.headers.get("x-late-signature") ??
      request.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 401 },
      );
    }

    const secret = process.env.LATE_WEBHOOK_SECRET;
    if (!secret) {
      console.error("LATE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { success: false, error: "Webhook not configured" },
        { status: 500 },
      );
    }

    const expectedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
    const expectedB64 = createHmac("sha256", secret).update(rawBody).digest("base64");

    // Normalize: Zernio may send "sha256=HEX" or "t=...,v1=HEX"
    const rawSig = signature.trim();
    const candidateSigs: string[] = [rawSig];
    const eqMatch = rawSig.match(/(?:^|[,;=])([a-f0-9]{64})\b/i);
    if (eqMatch) candidateSigs.push(eqMatch[1]);
    const prefixStripped = rawSig.replace(/^sha256=/i, "");
    candidateSigs.push(prefixStripped);

    const matches = candidateSigs.some((cand) => {
      // Try hex
      try {
        const a = Buffer.from(cand, "hex");
        const b = Buffer.from(expectedHex, "hex");
        if (a.length === b.length && timingSafeEqual(a, b)) return true;
      } catch {}
      // Try base64
      try {
        const a = Buffer.from(cand, "base64");
        const b = Buffer.from(expectedB64, "base64");
        if (a.length === b.length && timingSafeEqual(a, b)) return true;
      } catch {}
      return false;
    });

    if (!matches) {
      console.error("Zernio webhook signature verification failed", {
        received: rawSig.slice(0, 16) + "…" + rawSig.slice(-8),
        expectedHexHead: expectedHex.slice(0, 16),
      });
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const event = (body as { event?: string }).event;
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Missing event" },
        { status: 400 },
      );
    }

    switch (event) {
      case "post.published": {
        const { post } = body as ZernioPostPayload;
        const postId = post?.id;
        if (postId) {
          const accountId = extractAccountId(body);
          const acct = accountId
            ? await prisma.tikTokAccount.findFirst({
                where: { lateAccountId: accountId },
                select: { id: true, userId: true },
              })
            : null;
          if (!acct && accountId) {
            console.warn(
              `Zernio webhook: post.published ${postId} had accountId ${accountId} but no matching TikTokAccount`,
            );
          }
          if (acct) {
            await prisma.contentItem.upsert({
              where: { tiktokPostId: postId },
              update: { status: "POSTED", postedAt: new Date() },
              create: {
                title: truncateForDb(post.content, 180) || "Auto-generated video",
                status: "POSTED",
                postedAt: new Date(),
                tiktokPostId: postId,
                tiktokAccountId: acct.id,
                userId: acct.userId,
              },
            });
          } else {
            // No account context to attach a new row — update in place if it exists.
            await prisma.contentItem.updateMany({
              where: { tiktokPostId: postId },
              data: { status: "POSTED", postedAt: new Date() },
            });
          }
        }
        break;
      }

      case "post.failed":
      case "post.partial": {
        const { post } = body as ZernioPostPayload;
        const postId = post?.id;
        if (postId) {
          const accountId = extractAccountId(body);
          const acct = accountId
            ? await prisma.tikTokAccount.findFirst({
                where: { lateAccountId: accountId },
                select: { id: true, userId: true },
              })
            : null;
          if (!acct && accountId) {
            console.warn(
              `Zernio webhook: ${event} ${postId} had accountId ${accountId} but no matching TikTokAccount`,
            );
          }
          if (acct) {
            await prisma.contentItem.upsert({
              where: { tiktokPostId: postId },
              update: { status: "FAILED" },
              create: {
                title: truncateForDb(post.content, 180) || "Auto-generated video",
                status: "FAILED",
                tiktokPostId: postId,
                tiktokAccountId: acct.id,
                userId: acct.userId,
              },
            });
          } else {
            await prisma.contentItem.updateMany({
              where: { tiktokPostId: postId },
              data: { status: "FAILED" },
            });
          }

          const failedItem = await prisma.contentItem.findUnique({
            where: { tiktokPostId: postId },
            select: { user: { select: { email: true, name: true } } },
          });
          if (failedItem?.user?.email) {
            await sendPostFailedEmail({
              to: failedItem.user.email,
              postId,
              name: failedItem.user.name,
            });
          }
        }
        break;
      }

      case "account.disconnected": {
        const { account } = body as ZernioAccountPayload;
        const accountId = account?.accountId;
        if (accountId) {
          const existing = await prisma.tikTokAccount.findFirst({
            where: { lateAccountId: accountId },
            select: { id: true },
          });
          if (existing) {
            await prisma.tikTokAccount.update({
              where: { id: existing.id },
              data: {
                lateAccountId: null,
                username: `disconnected-${Date.now()}`,
              },
            });
          }
        }
        break;
      }

      case "webhook.test":
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Zernio webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
