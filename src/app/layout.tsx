import type { Metadata } from "next";
import { MedievalSharp, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const heading = MedievalSharp({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-heading-base",
});

const body = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-base",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-mono-base",
});

export const metadata: Metadata = {
  title: "DragonMadeIt — Faceless TikTok, Forged by Fire",
  description: "AI writes your scripts, renders your videos, posts to TikTok on autopilot. 66 content styles. Zero filming.",
  metadataBase: new URL("https://dragonmadeit.app"),
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "DragonMadeIt — Faceless TikTok, Forged by Fire",
    description: "AI writes, renders, and posts your TikToks on autopilot.",
    url: "https://dragonmadeit.app",
    siteName: "DragonMadeIt",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DragonMadeIt — Faceless TikTok, Forged by Fire",
    description: "AI writes, renders, and posts your TikToks on autopilot.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} ${mono.variable} antialiased`}>
        {children}
        <script src="https://js.paystack.co/v2/inline.js" defer />
      </body>
    </html>
  );
}
