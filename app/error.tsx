"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Root error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">Something went wrong</h1>
        
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. This has been logged and we'll look into it.
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
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border border-border font-mono text-sm rounded-md hover:bg-accent transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-card border border-border rounded-lg text-left">
            <p className="font-mono text-xs text-destructive mb-2">Dev mode error details:</p>
            <pre className="font-mono text-xs text-muted-foreground overflow-x-auto">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

