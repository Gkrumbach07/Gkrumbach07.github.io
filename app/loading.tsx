import { Navigation } from "@/components/navigation"

export default function Loading() {
  return (
    <main className="relative">
      <Navigation isHomePage />
      
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
            <span>Loading</span>
          </div>
        </div>
      </div>
    </main>
  )
}

