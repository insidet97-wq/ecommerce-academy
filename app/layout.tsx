import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import CookieBanner from "@/components/CookieBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:  "First Sale Lab — Stop learning. Start selling.",
    template: "%s | First Sale Lab",
  },
  description:
    "12 focused modules, real tools, and a personalised roadmap that gets complete beginners to their first online sale.",
  metadataBase: new URL("https://www.firstsalelab.com"),
  other: {
    "google-adsense-account": "ca-pub-1382028135058819",
  },
  openGraph: {
    siteName:    "First Sale Lab",
    type:        "website",
    locale:      "en_US",
    title:       "First Sale Lab — Stop learning. Start selling.",
    description: "12 focused modules, real tools, and a personalised roadmap that gets complete beginners to their first online sale.",
    url:         "https://www.firstsalelab.com",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "First Sale Lab — Stop learning. Start selling.",
    description: "12 focused modules, real tools, and a personalised roadmap that gets complete beginners to their first online sale.",
  },
  icons: {
    icon: [
      { url: "/icon.svg",  type: "image/svg+xml" },
      { url: "/logo.png",  type: "image/png",    sizes: "any" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* Vercel Analytics — cookieless / GDPR-compliant, no consent needed */}
        <Analytics />
        {/* GA4 + AdSense — gated behind cookie consent (renders nothing until "Accept all").
            AdSense site verification still works via the meta tag in metadata.other above —
            that meta tag is just text, no cookies, no script. */}
        <AnalyticsScripts />
        <CookieBanner />
      </body>
    </html>
  );
}
