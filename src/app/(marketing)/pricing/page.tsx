import type { Metadata } from "next";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing — Faceless TikTok Automation from $15/mo | DragonMadeIt",
  description: "AI-powered faceless TikTok automation starting at $15/mo. 14-day money-back guarantee. Cancel anytime.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingPageContent />;
}
