import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default:  "Ecommerce Academy — Stop learning. Start selling.",
    template: "%s | Ecommerce Academy",
  },
  description:
    "12 focused modules, real tools, and a personalised roadmap that gets complete beginners to their first online sale. Free forever.",
  metadataBase: new URL("https://ecommerce-academy.vercel.app"),
  openGraph: {
    siteName:    "Ecommerce Academy",
    type:        "website",
    locale:      "en_US",
    title:       "Ecommerce Academy — Stop learning. Start selling.",
    description: "12 focused modules, real tools, and a personalised roadmap that gets complete beginners to their first online sale.",
    url:         "https://ecommerce-academy.vercel.app",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Ecommerce Academy — Stop learning. Start selling.",
    description: "12 focused modules, real tools, and a personalised roadmap that gets complete beginners to their first online sale.",
  },
  icons: {
    icon: "/icon.svg",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
