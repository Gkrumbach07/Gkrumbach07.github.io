import type { Metadata } from "next"
import { ContentLayout } from "@/components/content-layout"
import { BackpackingMap } from "@/components/backpacking-map"
import { CoffeeSection } from "@/components/coffee-section"
import { Terminal, MapPin, Github, Linkedin } from "lucide-react"
import Link from "next/link"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gagekrumbach.com"

export const metadata: Metadata = {
  title: "About",
  description: "Software engineer at Red Hat, backpacker, and coffee enthusiast. Learn more about my journey in tech and outdoor adventures.",
  openGraph: {
    type: "profile",
    url: `${siteUrl}/about`,
    title: "About | Gage Krumbach",
    description: "Software engineer at Red Hat, backpacker, and coffee enthusiast.",
    // Uses root opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Gage Krumbach",
    description: "Software engineer at Red Hat, backpacker, and coffee enthusiast.",
    // Uses root opengraph-image.tsx
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
}

export default function AboutPage() {
  // Pass token from server to client component
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  return (
    <ContentLayout>

      {/* Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">~/about</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">About Me</h1>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              I'm a software engineer at{" "}
              <Link href="https://redhat.com" target="_blank" className="text-red-500 hover:underline font-medium">
                Red Hat
              </Link>
              , where I build open-source tools in the Kubernetes ecosystem, mostly around AI platforms and developer tooling.
            </p>

            <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              When I'm not writing code, I'm usually on a trail somewhere in the backcountry, dialing in my pour-over, or on the mats training BJJ. I like building things that live between complex systems and usable interfaces, and I tend to learn best by experimenting through side projects.
            </p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-4 mt-8">
            <Link
              href="https://github.com/gkrumbach07"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
            <Link
              href="https://linkedin.com/in/gage-krumbach/"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground border border-border rounded-md transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Link>
            
          </div>
        </div>
      </section>

      {/* Backpacking Section with Map */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Where I've Been</h2>
          </div>

          <p className="text-muted-foreground mb-8 max-w-2xl">
          I spend a lot of time backpacking and exploring wild places. These are some of the trails and parks I’ve had the chance to experience.
          </p>

          <BackpackingMap mapboxToken={mapboxToken} />
        </div>
      </section>

      {/* Coffee */}
      <section className="py-12 px-6 md:px-12 lg:px-24 pb-24">
        <div className="container mx-auto">
          <CoffeeSection />
        </div>
      </section>
    </ContentLayout>
  )
}
