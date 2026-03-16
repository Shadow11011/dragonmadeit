import type { Metadata } from "next";
import { FeaturesPageContent } from "./FeaturesPageContent";

export const metadata: Metadata = {
  title: "Features — Faceless TikTok Automation | DragonMadeIt",
  description: "AI content generation, automated posting, 66 viral niches, and growth analytics. The full faceless TikTok pipeline from script to screen.",
};

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
