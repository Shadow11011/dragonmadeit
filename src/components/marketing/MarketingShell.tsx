"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { HomepageScene } from "@/components/marketing/HomepageScene";
import { EmberBackground } from "@/components/marketing/EmberBackground";
import { type ReactNode } from "react";

interface MarketingShellProps {
  children: ReactNode;
}

/**
 * MarketingShell needs "use client" for usePathname().
 * We keep the client boundary here but ensure children (server components)
 * are passed through as ReactNode props, so they remain server-rendered.
 */
export function MarketingShell({ children }: MarketingShellProps) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  return (
    <div className="relative min-h-screen">
      <EmberBackground />
      <Navbar />

      {isHomepage ? (
        <HomepageScene />
      ) : (
        <main className="relative z-10 pt-16">{children}</main>
      )}

      <Footer />
    </div>
  );
}
