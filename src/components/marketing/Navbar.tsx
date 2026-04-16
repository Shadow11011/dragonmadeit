"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Announcement bar */}
      {!announcementDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-accent-fire text-white text-center text-sm py-2 px-4 flex items-center justify-center">
          <span className="flex-1 text-center font-body">
            Launch pricing — lock in current rates before they increase
          </span>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            className="ml-4 text-white/80 hover:text-white transition-colors shrink-0"
            aria-label="Dismiss announcement"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <motion.header
        className={cn(
          "fixed left-0 right-0 z-50 bg-bg-primary border-b border-border/50",
          announcementDismissed ? "top-0" : "top-[36px]"
        )}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold font-heading fire-text">
              <Image
                src="/images/dragon-mascot.png"
                alt="DragonMadeIt mascot"
                width={32}
                height={32}
                className="rounded-sm"
              />
              DragonMadeIt
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm transition-colors",
                    pathname === link.href
                      ? "text-accent-fire font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link href="/pricing">
                <Button size="sm">See Pricing</Button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              <span
                className={cn(
                  "block h-0.5 w-6 bg-text-primary transition-transform",
                  mobileOpen && "translate-y-2 rotate-45"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-6 bg-text-primary transition-opacity",
                  mobileOpen && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-6 bg-text-primary transition-transform",
                  mobileOpen && "-translate-y-2 -rotate-45"
                )}
              />
            </button>
          </div>
        </nav>

        {/* Mobile backdrop overlay */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-bg-primary/70"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Mobile menu — CSS transition instead of AnimatePresence for lighter bundle */}
        <div
          className={cn(
            "md:hidden bg-bg-primary border-t border-border/50 overflow-hidden transition-all duration-200 ease-in-out relative z-50",
            mobileOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="px-4 py-4 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block transition-colors",
                  pathname === link.href
                    ? "text-accent-fire font-medium"
                    : "text-text-secondary hover:text-text-primary"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-border/50" />
            <Link
              href="/login"
              className="block text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link href="/pricing" onClick={() => setMobileOpen(false)}>
              <Button className="w-full" size="sm">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>
    </>
  );
}
