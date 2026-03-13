import type { Metadata } from "next";
import { PricingPageContent } from "./PricingPageContent";

export const metadata: Metadata = {
  title: "Pricing — DragonMadeIt",
  description:
    "Choose your dragon tier. Affordable TikTok automation plans for creators of all sizes.",
};

export default function PricingPage() {
  return <PricingPageContent />;
}
