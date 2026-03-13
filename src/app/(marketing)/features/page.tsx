import type { Metadata } from "next";
import { FeaturesPageContent } from "./FeaturesPageContent";

export const metadata: Metadata = {
  title: "Features — DragonMadeIt",
  description:
    "Everything you need to dominate TikTok. AI content generation, smart scheduling, multi-account management, and more.",
};

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
