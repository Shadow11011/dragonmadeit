"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useDeviceCapability } from "@/hooks/useDeviceCapability";
import { LoadingScreen } from "@/components/three/LoadingScreen";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { CTASection } from "@/components/marketing/CTASection";
import { MobileFallback } from "@/components/marketing/MobileFallback";

const DynamicDragonScene = dynamic(
  () =>
    import("@/components/three/DragonScene").then((mod) => ({
      default: mod.DragonScene,
    })),
  { ssr: false, loading: () => <LoadingScreen /> }
);

interface MarketingShellProps {
  children: React.ReactNode;
}

export function MarketingShell({ children }: MarketingShellProps) {
  const pathname = usePathname();
  const { tier: deviceTier, hasWebGL } = useDeviceCapability();
  const isHomepage = pathname === "/";

  return (
    <div className="min-h-screen">
      <Navbar />

      {isHomepage && hasWebGL ? (
        <>
          <Suspense fallback={<LoadingScreen />}>
            <DynamicDragonScene complexity={deviceTier} />
          </Suspense>
          <div className="relative z-10">
            <HeroSection />
            <FeaturesSection />
            <PricingSection />
            <CTASection />
          </div>
        </>
      ) : isHomepage ? (
        <MobileFallback />
      ) : (
        <main className="pt-16">{children}</main>
      )}

      <Footer />
    </div>
  );
}
