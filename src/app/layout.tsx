import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const site = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Softgress Virtual HQ: Software Development & Digital Marketing Agency",
    template: "%s · Softgress",
  },
  description:
    "Walk through the Softgress headquarters: meet AI guides for software development, digital marketing, creative production and AI automation, then request a quote or consultation.",
  applicationName: "Softgress Virtual HQ",
  openGraph: {
    type: "website",
    siteName: "Softgress",
    title: "Softgress Virtual HQ",
    description: "Ideas engineered. Growth accelerated. Tour our virtual office and plan your project with AI guides.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#07111F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
