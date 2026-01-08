"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ContentLayout } from "@/components/content-layout"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function BlogPostError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Blog post error:", error)
  }, [error])

  return (
    <ContentLayout>
      
      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Failed to load blog post</h1>
          
          <p className="text-muted-foreground mb-8">
            We couldn't load this blog post. It might have been moved or there was an issue fetching it from GitHub.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-mono text-sm rounded-md hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border font-mono text-sm rounded-md hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to blog
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-8 p-4 bg-card border border-border rounded-lg text-left">
              <p className="font-mono text-xs text-destructive mb-2">Error details:</p>
              <pre className="font-mono text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                {error.message}
              </pre>
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  )
}

