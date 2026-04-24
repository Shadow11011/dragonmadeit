import type { Metadata } from "next";
import { AboutPageContent } from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About · DragonMadeIt",
  description:
    "DragonMadeIt is a three-path content engine: generate faceless videos, repurpose long-form content, or schedule your own. Built for small operators who need consistent output across TikTok, Instagram Reels, and YouTube Shorts.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return <AboutPageContent />;
}
