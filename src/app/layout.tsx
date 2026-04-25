import type { Metadata } from "next";
import { Bricolage_Grotesque, Source_Sans_3, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Bricolage Grotesque for headings: humanist grotesque with personality at
// large sizes. Avoids the Inter/DM Sans default monoculture without going twee.
const heading = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
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
  title: "DragonMadeIt — A content engine that runs itself",
  description:
    "Generate, repurpose, or schedule short-form content across TikTok, Instagram Reels, and YouTube Shorts. Configure once, then focus on everything else.",
  metadataBase: new URL("https://dragonmadeit.app"),
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/images/brand/dragonmark-dark-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/brand/dragonmark-dark-64.png", sizes: "64x64", type: "image/png" },
      { url: "/images/brand/dragonmark-dark-256.png", sizes: "256x256", type: "image/png" },
    ],
    apple: "/images/brand/dragonmark-dark-256.png",
  },
  openGraph: {
    title: "DragonMadeIt — A content engine that runs itself",
    description:
      "Generate, repurpose, or schedule short-form content across TikTok, Instagram Reels, and YouTube Shorts.",
    url: "https://dragonmadeit.app",
    siteName: "DragonMadeIt",
    images: [{ url: "/images/brand/dragonmark-light-256.png", width: 256, height: 256 }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DragonMadeIt — A content engine that runs itself",
    description:
      "Generate, repurpose, or schedule short-form content across TikTok, Instagram Reels, and YouTube Shorts.",
    images: ["/images/brand/dragonmark-light-256.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('dmi-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(_) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${heading.variable} ${body.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
