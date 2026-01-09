import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gagekrumbach.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gage Krumbach | Software Engineer",
    template: "%s | Gage Krumbach",
  },
  description:
    "Software engineer at Red Hat building open source tools in the Kubernetes ecosystem. Writing about software engineering, AI, backpacking, and coffee.",
  keywords: [
    "Gage Krumbach",
    "Software Engineer",
    "Red Hat",
    "Kubernetes",
    "Open Source",
    "Developer",
    "Full Stack",
    "React",
    "TypeScript",
    "AI",
    "Machine Learning",
  ],
  authors: [{ name: "Gage Krumbach", url: siteUrl }],
  creator: "Gage Krumbach",
  publisher: "Gage Krumbach",
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
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Gage Krumbach",
    title: "Gage Krumbach | Software Engineer",
    description:
      "Software engineer at Red Hat building open source tools in the Kubernetes ecosystem. Writing about software engineering, AI, backpacking, and coffee.",
    // OG image is auto-generated from app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Gage Krumbach | Software Engineer",
    description:
      "Software engineer at Red Hat building open source tools in the Kubernetes ecosystem.",
    // Twitter image uses the OG image from app/opengraph-image.tsx
    creator: "@gagekrumbach", // Update with your actual Twitter handle if you have one
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v3.17.0/mapbox-gl.css" />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
