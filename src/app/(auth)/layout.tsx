import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Left side — brand reinforcement (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary border-r border-border flex-col justify-center px-12 xl:px-16">
        <Link href="/" className="text-3xl font-bold fire-text mb-8">
          DragonMadeIt
        </Link>
        <h2 className="text-2xl font-bold text-text-primary mb-4">
          Your faceless TikTok empire starts here.
        </h2>
        <ul className="space-y-3 mb-8">
          {[
            "66 viral content styles",
            "AI creates and posts automatically",
            "Cancel anytime — 14-day money-back guarantee",
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-text-secondary">
              <svg className="w-4 h-4 text-accent-fire shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
        {/* Testimonial */}
        <div className="bg-bg-tertiary/50 border border-border rounded-lg p-4">
          <p className="text-sm text-text-primary italic">
            &ldquo;I set it up on a Sunday, and by Wednesday I had 3 videos posted automatically. This thing just works.&rdquo;
          </p>
          <p className="text-xs text-text-secondary mt-2">— Alex R., Reddit Stories niche</p>
        </div>
        {/* Trust badge */}
        <div className="mt-6 flex items-center gap-1.5 text-xs text-text-secondary">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secured by Gumroad
        </div>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Mobile brand tagline */}
        <p className="lg:hidden text-center text-sm text-text-secondary mb-6">
          Your faceless TikTok empire starts here.
        </p>
        {children}
      </div>
    </div>
  );
}
