"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DragonMark } from "@/components/marketing/primitives/DragonMark";
import { ThemeToggle } from "@/components/marketing/primitives/ThemeToggle";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(true);
  const pathname = usePathname();

  return (
    <>
      {announceOpen && (
        <div className="announce" style={{ position: "relative", zIndex: 60 }}>
          <span>Currently in early access. Start free with the FREE tier.</span>
          <button
            onClick={() => setAnnounceOpen(false)}
            style={{ marginLeft: 12, opacity: 0.7 }}
            aria-label="Dismiss announcement"
          >
            ×
          </button>
        </div>
      )}

      <header className="nav">
        <div className="wrap-wide row" style={{ height: 68, justifyContent: "space-between" }}>
          <Link href="/" className="row gap-3" style={{ alignItems: "center" }}>
            <DragonMark />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 18,
                letterSpacing: "0.01em",
                fontWeight: 600,
              }}
            >
              DragonMadeIt
            </span>
          </Link>

          <nav className="row gap-8 desktop-only" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: 14,
                    color: active ? "var(--text-1)" : "var(--text-2)",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.02em",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="row gap-4">
            <Link
              href="/login"
              className="desktop-only"
              style={{ fontSize: 14, color: "var(--text-2)" }}
            >
              Sign in
            </Link>
            <ThemeToggle />
            <Link href="/pricing" className="btn btn-primary btn-sm">
              Get started
            </Link>
            <button
              className="mobile-only"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: 6,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  background: "var(--text-1)",
                  transform: mobileOpen ? "translateY(6px) rotate(45deg)" : undefined,
                  transition: "transform 0.2s",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  background: "var(--text-1)",
                  opacity: mobileOpen ? 0 : 1,
                  transition: "opacity 0.2s",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 2,
                  background: "var(--text-1)",
                  transform: mobileOpen ? "translateY(-6px) rotate(-45deg)" : undefined,
                  transition: "transform 0.2s",
                }}
              />
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div
            className="mobile-only"
            style={{
              borderTop: "1px solid var(--border-soft)",
              background: "var(--bg-0)",
              padding: "16px 28px 24px",
            }}
          >
            <div className="stack gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontSize: 15,
                    color: pathname === link.href ? "var(--text-1)" : "var(--text-2)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{ fontSize: 15, color: "var(--text-2)" }}
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      <style jsx global>{`
        .desktop-only { display: none; }
        .mobile-only { display: inline-flex; }
        @media (min-width: 760px) {
          .desktop-only { display: inline-flex; }
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
