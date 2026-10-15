import type { Metadata, Viewport } from "next";
import { Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["300", "400", "500", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const site = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Softgress: Software Development & Digital Marketing Agency",
    template: "%s · Softgress",
  },
  description:
    "Softgress is a digital marketing and software development agency: software, marketing, creative production, AI automation and strategy. Request a quote or book a consultation.",
  applicationName: "Softgress",
  openGraph: {
    type: "website",
    siteName: "Softgress",
    title: "Softgress",
    description: "Ideas engineered. Growth accelerated. Digital marketing and software development under one roof.",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#04060F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${roboto.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
