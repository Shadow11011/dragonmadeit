import Link from "next/link";
import { DragonMark } from "@/components/marketing/primitives/DragonMark";

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap-wide">
        <div className="footer-grid">
          <div>
            <div className="row gap-3">
              <DragonMark />
              <span className="h3">DragonMadeIt</span>
            </div>
            <p className="text-2 mt-4" style={{ maxWidth: 320, fontSize: 14 }}>
              A content engine that runs itself. Generate, repurpose, or schedule short-form across TikTok, Reels, and Shorts.
            </p>
            <div
              className="row mt-6"
              style={{
                fontSize: 12,
                color: "var(--text-3)",
                flexWrap: "wrap",
                gap: "6px 14px",
              }}
            >
              <span>Official TikTok API</span>
              <span aria-hidden>·</span>
              <span>Secured by Dodo Payments</span>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Product
            </div>
            <ul className="stack gap-3" style={{ fontSize: 14 }}>
              <li>
                <Link href="/features">Features</Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Company
            </div>
            <ul className="stack gap-3" style={{ fontSize: 14 }}>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/#how-it-works">How it works</Link>
              </li>
              <li>
                <a href="mailto:support@dragonmadeit.app">Support</a>
              </li>
            </ul>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>
              Legal
            </div>
            <ul className="stack gap-3" style={{ fontSize: 14 }}>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="molten-divider mt-16" />
        <div
          className="footer-bottom row mt-8"
          style={{ justifyContent: "space-between", fontSize: 12, color: "var(--text-3)" }}
        >
          <span>© 2026 DragonMadeIt. Built for short-form operators.</span>
          <span className="mono">v2.0</span>
        </div>
      </div>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
        @media (max-width: 760px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .footer-bottom { flex-direction: column; gap: 12px; align-items: flex-start !important; }
        }
      `}</style>
    </footer>
  );
}
