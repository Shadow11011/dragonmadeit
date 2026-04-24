import type { Metadata } from "next";
import { HomepageScene } from "@/components/marketing/HomepageScene";

export const metadata: Metadata = {
  title: "DragonMadeIt · A Content Engine That Runs Itself",
  description:
    "Generate faceless videos, repurpose long-form content, or schedule your own shorts. Posts to TikTok, Instagram Reels, and YouTube Shorts on the cadence you set.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <HomepageScene />;
}
