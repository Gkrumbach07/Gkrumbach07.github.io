"use client"

import { FileQuestion, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ContentLayout } from "@/components/content-layout"

export default function NotFound() {
  return (
    <ContentLayout>
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Page not found</h1>
          
          <p className="text-muted-foreground mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <p className="font-mono text-sm text-muted-foreground mb-8">
            Error 404: Resource not found
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-border font-mono text-sm rounded-md hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

