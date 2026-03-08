import "./globals.css";
import React from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToggle";
import { Roboto_Mono } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Code Style CV Generator - Create Professional Developer Resumes",
    template: "%s | Code Style CV Generator",
  },
  description:
    "Generate professional developer-style CVs with terminal aesthetics. Create, preview, and export your resume as PDF with real-time editing and modern design.",
  keywords: [
    "cv generator",
    "resume builder",
    "developer resume",
    "code style cv",
    "terminal resume",
    "pdf export",
    "professional resume",
    "developer portfolio",
    "resume creator",
    "cv maker",
    "markdown resume",
    "json resume",
    "tech resume",
    "software engineer resume",
    "programmer cv",
  ],
  authors: [{ name: "Code Style CV Generator" }],
  creator: "Code Style CV Generator",
  publisher: "Code Style CV Generator",
  category: "productivity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://code-style-cv-generator.quang.work"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Code Style CV Generator - Create Professional Developer Resumes",
    description:
      "Generate professional developer-style CVs with terminal aesthetics. Create, preview, and export your resume as PDF with real-time editing and modern design.",
    siteName: "Code Style CV Generator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Code Style CV Generator - Professional developer resume builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Code Style CV Generator - Create Professional Developer Resumes",
    description:
      "Generate professional developer-style CVs with terminal aesthetics. Create, preview, and export your resume as PDF.",
    images: ["/og-image.png"],
    creator: "@codestylecv",
  },
  // verification: {
  //   google: "google-site-verification-code",
  // },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Code Style CV Generator",
    description:
      "Generate professional developer-style CVs with terminal aesthetics",
    url: "https://code-style-cv-generator.quang.work",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "Code Style CV Generator",
    },
    featureList: [
      "Real-time resume editing",
      "PDF export functionality",
      "Terminal-style design",
      "Professional templates",
      "Dark/Light mode support",
      "Responsive design",
      "No registration required",
    ],
    screenshot: "https://code-style-cv-generator.quang.work/og-image.png",
  };

  return (
    <html lang="en" suppressHydrationWarning className={robotoMono.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-mono">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeToggle />
          {children}
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  );
}
