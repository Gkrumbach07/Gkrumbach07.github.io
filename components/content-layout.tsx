import type React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

type ContentLayoutProps = {
  children: React.ReactNode
}

export const ContentLayout = ({ children }: ContentLayoutProps) => {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      {children}
      <Footer />
    </main>
  )
}

