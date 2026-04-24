import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service · DragonMadeIt",
  description: "Terms of Service for DragonMadeIt content automation platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-text-primary mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-text-secondary mb-12">
          Last updated: March 15, 2026
        </p>

        <div className="space-y-8 text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using DragonMadeIt (&quot;the Service&quot;), you
              agree to be bound by these Terms of Service. If you do not agree to
              these terms, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              2. Description of Service
            </h2>
            <p>
              DragonMadeIt is a TikTok content automation platform that provides
              AI-powered content generation, scheduling, and automated posting
              services. The Service is provided on a subscription basis across
              multiple tiers (Hatchling, Drake, and Elder Dragon).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              3. Account Registration
            </h2>
            <p>
              You must provide accurate and complete information when creating an
              account. You are responsible for maintaining the security of your
              account credentials and for all activities that occur under your
              account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              4. Subscription & Billing
            </h2>
            <p>
              Subscriptions are billed on a recurring basis (monthly, quarterly,
              or annually). You may cancel your subscription at any time.
              Cancellation takes effect at the end of the current billing period.
              Upon cancellation, your linked TikTok account will be unlinked and
              automated posting will stop.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              5. Acceptable Use
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Violate any applicable laws or regulations</li>
              <li>
                Violate TikTok&apos;s Terms of Service or Community Guidelines
              </li>
              <li>Post spam, misleading, or harmful content</li>
              <li>Infringe on any third-party intellectual property rights</li>
              <li>Attempt to circumvent usage limits of your subscription tier</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              6. Content Ownership
            </h2>
            <p>
              You retain ownership of any content you provide to the Service. By
              using the Service, you grant DragonMadeIt a limited license to
              process, store, and publish your content on TikTok as directed by
              your account settings. AI-generated content created through the
              Service is owned by you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              7. Limitation of Liability
            </h2>
            <p>
              DragonMadeIt is provided &quot;as is&quot; without warranties of
              any kind. We are not responsible for any actions taken by TikTok
              regarding your account, including suspension or removal of content.
              Our total liability is limited to the amount you paid for the
              Service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              8. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your account if you
              violate these Terms. Upon termination, your right to use the
              Service ceases immediately and any linked TikTok accounts will be
              unlinked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              9. Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. We will notify you of
              material changes via email or through the Service. Continued use
              after changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-text-primary mb-3">
              10. Contact
            </h2>
            <p>
              If you have questions about these Terms, contact us at{" "}
              <a
                href="mailto:legal@dragonmadeit.com"
                className="text-accent-fire hover:underline"
              >
                legal@dragonmadeit.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
