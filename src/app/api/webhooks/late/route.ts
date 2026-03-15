import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPostFailedEmail } from "@/lib/email";

interface LateWebhookPayload {
  event: string;
  data: Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const payload = body as LateWebhookPayload;
    const { event, data } = payload;

    if (!event || !data) {
      return NextResponse.json(
        { success: false, error: "Missing event or data" },
        { status: 400 }
      );
    }

    switch (event) {
      case "post.published": {
        const postId = data.postId as string | undefined;
        if (postId) {
          await prisma.contentItem.updateMany({
            where: { tiktokPostId: postId },
            data: {
              status: "POSTED",
              postedAt: new Date(),
            },
          });
          console.log(`Late webhook: post ${postId} published`);
        }
        break;
      }

      case "post.failed": {
        const postId = data.postId as string | undefined;
        if (postId) {
          await prisma.contentItem.updateMany({
            where: { tiktokPostId: postId },
            data: { status: "FAILED" },
          });
          console.log(`Late webhook: post ${postId} failed`);

          const failedItem = await prisma.contentItem.findFirst({
            where: { tiktokPostId: postId },
            select: { user: { select: { email: true, name: true } } },
          });
          if (failedItem?.user?.email) {
            sendPostFailedEmail({
              to: failedItem.user.email,
              postId,
              name: failedItem.user.name,
            });
          }
        }
        break;
      }

      case "account.disconnected": {
        const accountId = data.accountId as string | undefined;
        if (accountId) {
          const account = await prisma.tikTokAccount.findFirst({
            where: { lateAccountId: accountId },
            select: { id: true },
          });

          if (account) {
            await prisma.tikTokAccount.update({
              where: { id: account.id },
              data: {
                lateAccountId: null,
                username: `disconnected-${Date.now()}`,
              },
            });
            console.log(
              `Late webhook: account ${accountId} disconnected, updated TikTokAccount ${account.id}`
            );
          }
        }
        break;
      }

      case "webhook.test": {
        console.log("Late webhook: test event received");
        break;
      }

      default: {
        console.log(`Late webhook: unhandled event ${event}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Late webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
