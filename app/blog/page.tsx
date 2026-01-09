import { ContentLayout } from "@/components/content-layout"
import { SectionHeader } from "@/components/section-header"
import { BlogCard } from "@/components/blog-card"
import { getAllPosts } from "@/lib/blog"
import { Terminal } from "lucide-react"

export const metadata = {
  title: "Blog | Gage Krumbach",
  description: "Writings about software engineering, open source, backpacking, and coffee",
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const pinnedPosts = posts.filter((p) => p.pinned)
  const otherPosts = posts.filter((p) => !p.pinned)

  return (
    <ContentLayout>

      {/* Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">~/blog</span>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Thoughts on technology, ai, nature, and the
              perfect cup of coffee.
            </p>
          </div>
        </div>
      </section>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <section className="py-12 px-6 md:px-12 lg:px-24">
          <div className="container mx-auto">
            <SectionHeader title="Pinned" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pinnedPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts */}
      <section className="py-12 px-6 md:px-12 lg:px-24 pb-24">
        <div className="container mx-auto">
          <SectionHeader title="All Posts" />

          <div className="space-y-4">
            {otherPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {posts.length === 0 && (
            <div className="text-center py-16">
              <p className="font-mono text-muted-foreground">No posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </ContentLayout>
  )
}
