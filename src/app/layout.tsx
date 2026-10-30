import type { Metadata, Viewport } from "next";
import { Geist_Mono, Roboto } from "next/font/google";
import { JsonLd } from "@/components/site/JsonLd";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/content/seo";
import { LOCALE, SITE_NAME, SITE_URL, graph, organizationLd, websiteLd } from "@/lib/seo";
import "./globals.css";

const roboto = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["300", "400", "500", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s · Softgress",
  },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Software development and digital marketing",
  // Canonical and og:url are set per page (see pageMeta) so no page inherits the home URL.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: LOCALE,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  other: { "geo.region": "IN-MH", "geo.placename": "Pimpri-Chinchwad, Pune" },
};

export const viewport: Viewport = {
  themeColor: "#04060F",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${roboto.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <JsonLd data={graph(organizationLd(process.env.CONTACT_EMAIL || undefined), websiteLd())} />
        {children}
      </body>
    </html>
  );
}
