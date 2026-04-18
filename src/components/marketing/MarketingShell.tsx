"use client";

import { type ReactNode } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { EmberField } from "@/components/marketing/primitives/EmberField";

interface MarketingShellProps {
  children: ReactNode;
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <EmberField />
      <Navbar />
      <main style={{ position: "relative", zIndex: 2 }}>{children}</main>
      <Footer />
    </div>
  );
}
