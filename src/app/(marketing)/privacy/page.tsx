import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy · DragonMadeIt",
  description: "Privacy Policy for DragonMadeIt content automation platform.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-text-secondary mb-12">
          Last updated: March 15, 2026
        </p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              We collect information you provide directly to us:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong className="text-text-primary">Account information:</strong>{" "}
                name, email address, and password when you create an account
              </li>
              <li>
                <strong className="text-text-primary">Payment information:</strong>{" "}
                processed securely through Paystack. We do not store your full
                credit card details.
              </li>
              <li>
                <strong className="text-text-primary">TikTok account data:</strong>{" "}
                OAuth tokens and basic profile information when you link your
                TikTok account
              </li>
              <li>
                <strong className="text-text-primary">Content preferences:</strong>{" "}
                your content configuration, posting schedules, and style
                preferences
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve the Service</li>
              <li>Generate and publish content to your TikTok account</li>
              <li>Process payments and manage your subscription</li>
              <li>Send you service-related communications</li>
              <li>Monitor and analyze usage trends</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              3. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <strong className="text-text-primary">TikTok:</strong> to publish
                content on your behalf via their API
              </li>
              <li>
                <strong className="text-text-primary">Paystack:</strong> to process
                payments securely
              </li>
              <li>
                <strong className="text-text-primary">Service providers:</strong>{" "}
                infrastructure and hosting providers necessary to operate the
                Service
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              4. Data Security
            </h2>
            <p>
              We implement appropriate security measures to protect your
              information, including encryption in transit and at rest. TikTok
              OAuth tokens are stored securely and are never exposed to the
              client. However, no method of transmission over the internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              5. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. When you
              cancel your subscription, your linked TikTok account is unlinked
              and associated OAuth tokens are deleted. Account data is retained
              for 30 days after cancellation, after which it is permanently
              deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              6. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for data processing</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              7. Cookies
            </h2>
            <p>
              We use essential cookies for authentication and session management.
              We do not use third-party tracking cookies or advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              8. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify
              you of any material changes by posting the new policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              9. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
              <a
                href="mailto:privacy@dragonmadeit.com"
                className="text-accent-fire hover:underline"
              >
                privacy@dragonmadeit.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
