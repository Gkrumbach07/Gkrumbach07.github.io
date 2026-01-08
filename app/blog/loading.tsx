import { ContentLayout } from "@/components/content-layout"
import { SectionHeader } from "@/components/section-header"
import { BlogCardSkeleton } from "@/components/skeletons/blog-card-skeleton"
import { Terminal } from "lucide-react"

export default function BlogLoading() {
  return (
    <ContentLayout>

      {/* Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">~/blog</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Thoughts on technology, ai, nature, and the perfect cup of coffee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loading skeleton */}
      <section className="py-12 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <SectionHeader title="All Posts" />

          <div className="space-y-4">
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
            <BlogCardSkeleton />
          </div>
        </div>
      </section>
    </ContentLayout>
  )
}

