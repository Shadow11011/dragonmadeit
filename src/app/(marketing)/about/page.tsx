import type { Metadata } from "next";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About — The Story Behind DragonMadeIt | Faceless TikTok Automation",
  description: "One dev, one dragon, one mission: automate faceless TikTok content creation. Learn how DragonMadeIt builds and posts AI videos on autopilot.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
