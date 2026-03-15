"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { type ReactNode } from "react";

interface MarketingShellProps {
  children: ReactNode;
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="relative z-10 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
