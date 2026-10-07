import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer, Header } from "@/components/SiteChrome";
import {
  SITE_DESCRIPTION,
  SITE_FULL_NAME,
  SITE_NAME,
  SITE_TAGLINE,
  absoluteUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),

  title: {
    default: `${SITE_NAME} — ${SITE_FULL_NAME} | ${SITE_TAGLINE.replace(".", "")}`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,

  keywords: [
    "Pranav Academic & Research Initiative",
    "PARI",
    "research",
    "research papers",
    "research briefs",
    "scientific research",
    "academic research",
    "AI research",
    "student research",
  ],

  authors: [
    {
      name: SITE_FULL_NAME,
    },
  ],

  openGraph: {
    title: `${SITE_NAME} — ${SITE_FULL_NAME}`,
    description: SITE_DESCRIPTION,
    siteName: SITE_FULL_NAME,
    type: "website",
    url: absoluteUrl("/"),
  },

  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_FULL_NAME}`,
    description: SITE_DESCRIPTION,
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,500;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-screen">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
