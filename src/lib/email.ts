import { Resend } from "resend";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  const globalForResend = globalThis as unknown as {
    resend: Resend | undefined;
  };
  if (!globalForResend.resend) {
    globalForResend.resend = new Resend(process.env.RESEND_API_KEY);
  }
  return globalForResend.resend;
}

const FROM_EMAIL = "DragonMadeIt <hello@dragonmadeit.app>";

const DASHBOARD_URL =
  process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function wrapInTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DragonMadeIt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px; border-bottom: 2px solid #ff4500;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ff4500; letter-spacing: 1px;">
                DragonMadeIt
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 0; color: #e4e4e7; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px; border-top: 1px solid #27272a;">
              <p style="margin: 0; font-size: 13px; color: #71717a;">
                DragonMadeIt &mdash; TikTok Automation on Autopilot
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string;
  name: string | null;
}): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    const greeting = name ? `Hi ${name},` : "Hi there,";
    const html = wrapInTemplate(`
              <p style="margin: 0 0 16px; color: #e4e4e7;">${greeting}</p>
              <p style="margin: 0 0 16px; color: #e4e4e7;">
                Welcome to <strong style="color: #ff4500;">DragonMadeIt</strong>! You're one step away from
                putting your TikTok content on autopilot. Set it and forget it &mdash; your dragon handles the rest.
              </p>
              <p style="margin: 0 0 24px; color: #e4e4e7;">
                Head to your dashboard to pick a plan and start automating.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #ff4500; border-radius: 6px;">
                    <a href="${DASHBOARD_URL}/dashboard" target="_blank"
                       style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Go to Dashboard
                    </a>
                  </td>
                </tr>
              </table>
    `);

    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Welcome to DragonMadeIt",
      html,
    });
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
}

export async function sendPaymentConfirmedEmail({
  to,
  tier,
  name,
}: {
  to: string;
  tier: string;
  name: string | null;
}): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    const greeting = name ? `Hi ${name},` : "Hi there,";
    const tierDisplay = tier.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const html = wrapInTemplate(`
              <p style="margin: 0 0 16px; color: #e4e4e7;">${greeting}</p>
              <p style="margin: 0 0 16px; color: #e4e4e7;">
                Your payment has been confirmed! You're now on the
                <strong style="color: #ff4500;">${tierDisplay}</strong> plan.
              </p>
              <p style="margin: 0 0 24px; color: #e4e4e7;">
                Next step: link your TikTok account so your dragon can start posting for you.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #ff4500; border-radius: 6px;">
                    <a href="${DASHBOARD_URL}/dashboard/accounts" target="_blank"
                       style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Link TikTok Account
                    </a>
                  </td>
                </tr>
              </table>
    `);

    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Payment Confirmed - Your Dragon is Ready",
      html,
    });
  } catch (error) {
    console.error("Failed to send payment confirmed email:", error);
  }
}

export async function sendPaymentFailedEmail({
  to,
  name,
}: {
  to: string;
  name: string | null;
}): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    const greeting = name ? `Hi ${name},` : "Hi there,";
    const html = wrapInTemplate(`
              <p style="margin: 0 0 16px; color: #e4e4e7;">${greeting}</p>
              <p style="margin: 0 0 16px; color: #e4e4e7;">
                We were unable to process your latest payment. Your automation may be paused
                until this is resolved.
              </p>
              <p style="margin: 0 0 24px; color: #e4e4e7;">
                Please update your payment method to keep your dragon flying.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #ff4500; border-radius: 6px;">
                    <a href="${DASHBOARD_URL}/dashboard/settings" target="_blank"
                       style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Update Payment Method
                    </a>
                  </td>
                </tr>
              </table>
    `);

    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Payment Failed - Action Required",
      html,
    });
  } catch (error) {
    console.error("Failed to send payment failed email:", error);
  }
}

export async function sendVerificationCodeEmail({
  to,
  code,
}: {
  to: string;
  code: string;
}): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    const html = wrapInTemplate(`
              <p style="margin: 0 0 16px; color: #e4e4e7;">
                Enter this code to verify your email address:
              </p>
              <div style="margin: 0 0 24px; text-align: center;">
                <span style="display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ff4500; font-family: monospace; background-color: #1a1a2e; padding: 16px 24px; border-radius: 8px; border: 1px solid #27272a;">
                  ${code}
                </span>
              </div>
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                This code expires in 10 minutes. If you didn&rsquo;t request this, you can safely ignore this email.
              </p>
    `);

    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Your DragonMadeIt verification code",
      html,
    });
  } catch (error) {
    console.error("Failed to send verification code email:", error);
  }
}

export async function sendPasswordResetCodeEmail({
  to,
  code,
}: {
  to: string;
  code: string;
}): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    const html = wrapInTemplate(`
              <p style="margin: 0 0 16px; color: #e4e4e7;">
                Enter this code to reset your password:
              </p>
              <div style="margin: 0 0 24px; text-align: center;">
                <span style="display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ff4500; font-family: monospace; background-color: #1a1a2e; padding: 16px 24px; border-radius: 8px; border: 1px solid #27272a;">
                  ${code}
                </span>
              </div>
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                This code expires in 10 minutes. If you didn&rsquo;t request a password reset, you can safely ignore this email.
              </p>
    `);

    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset your DragonMadeIt password",
      html,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

export async function sendPostFailedEmail({
  to,
  postId,
  name,
}: {
  to: string;
  postId: string;
  name: string | null;
}): Promise<void> {
  const client = getResendClient();
  if (!client) return;

  try {
    const greeting = name ? `Hi ${name},` : "Hi there,";
    const html = wrapInTemplate(`
              <p style="margin: 0 0 16px; color: #e4e4e7;">${greeting}</p>
              <p style="margin: 0 0 16px; color: #e4e4e7;">
                A scheduled post failed to publish.
              </p>
              <p style="margin: 0 0 16px; color: #71717a; font-size: 14px;">
                Post ID: <code style="background-color: #1a1a2e; padding: 2px 6px; border-radius: 4px; color: #e4e4e7;">${postId}</code>
              </p>
              <p style="margin: 0 0 24px; color: #e4e4e7;">
                This can happen if your TikTok session expired or the account was disconnected.
                Please check your account health in the dashboard.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="background-color: #ff4500; border-radius: 6px;">
                    <a href="${DASHBOARD_URL}/dashboard" target="_blank"
                       style="display: inline-block; padding: 12px 28px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">
                      Check Dashboard
                    </a>
                  </td>
                </tr>
              </table>
    `);

    await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Post Failed to Publish",
      html,
    });
  } catch (error) {
    console.error("Failed to send post failed email:", error);
  }
}
