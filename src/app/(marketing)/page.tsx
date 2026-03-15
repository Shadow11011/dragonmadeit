import type { Metadata } from "next";
import { HomepageScene } from "@/components/marketing/HomepageScene";

export const metadata: Metadata = {
  title: "DragonMadeIt — AI-Powered TikTok Automation",
  description:
    "Set it and forget it. AI-powered TikTok content automation that grows your audience on autopilot.",
};

export default function HomePage() {
  return <HomepageScene />;
}
