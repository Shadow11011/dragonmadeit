import type { Metadata } from "next";
import { FeaturesPageContent } from "./FeaturesPageContent";

export const metadata: Metadata = {
  title: "Features · A content engine that runs itself | DragonMadeIt",
  description: "Generate faceless videos, repurpose long-form content, or schedule what you already make. Posts to TikTok, Instagram Reels, and YouTube Shorts.",
  alternates: { canonical: "/features" },
};

export default function FeaturesPage() {
  return <FeaturesPageContent />;
}
