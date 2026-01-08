"use client"

import { SectionHeader } from "./section-header"
import { BlogCard, type BlogPost } from "./blog-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface PinnedBlogsProps {
  posts: BlogPost[]
}

export function PinnedBlogs({ posts }: PinnedBlogsProps) {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-background">
      <SectionHeader title="Latest Writings" />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-muted-foreground font-mono text-sm">
              Check back soon for new writings and thoughts.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {posts.slice(0, 3).map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          <div className="flex justify-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 font-mono text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Read all posts
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
