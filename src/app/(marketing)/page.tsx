import type { Metadata } from "next";
import { HomepageScene } from "@/components/marketing/HomepageScene";

export const metadata: Metadata = {
  title: "DragonMadeIt — Faceless TikTok Automation | AI Videos on Autopilot",
  description: "AI writes scripts, generates videos, and posts to TikTok on autopilot. 66 content styles. No filming. No face. Starting at $15/mo.",
};

export default function HomePage() {
  return <HomepageScene />;
}
