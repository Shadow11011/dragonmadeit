import type { Metadata } from "next";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing · Content engine for TikTok, Reels, and Shorts | DragonMadeIt",
  description: "Start free, no card. Paid plans to generate, repurpose, or schedule content across TikTok, Instagram Reels, and YouTube Shorts. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingPageContent />;
}
