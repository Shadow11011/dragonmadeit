import type { Metadata } from "next";
import { Young_Serif, Figtree } from "next/font/google";
import "./globals.css";

const heading = Young_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-heading",
});

const body = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "DragonMadeIt — TikTok Automation",
  description: "Set it and forget it. AI-powered TikTok content automation.",
  metadataBase: new URL("https://dragonmadeit.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/images/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "DragonMadeIt — TikTok Automation",
    description: "Set it and forget it. AI-powered TikTok content automation.",
    url: "https://dragonmadeit.app",
    siteName: "DragonMadeIt",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DragonMadeIt — TikTok Automation",
    description: "Set it and forget it. AI-powered TikTok content automation.",
    images: ["/images/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${heading.variable} ${body.variable} font-body bg-bg-primary text-text-primary antialiased`}>
        {children}
        <script src="https://js.paystack.co/v2/inline.js" defer />
      </body>
    </html>
  );
}
