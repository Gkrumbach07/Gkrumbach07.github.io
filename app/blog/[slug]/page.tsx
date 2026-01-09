import { ContentLayout } from "@/components/content-layout"
import { getPostBySlug, getAllPosts } from "@/lib/blog"
import { markdownToHtml } from "@/lib/markdown"
import { notFound } from "next/navigation"
import { Calendar, Clock, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gagekrumbach.com"

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: "Post Not Found" }
  }

  const postUrl = `${siteUrl}/blog/${slug}`

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: "Gage Krumbach" }],
    openGraph: {
      type: "article",
      url: postUrl,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: ["Gage Krumbach"],
      tags: post.tags,
      siteName: "Gage Krumbach",
      // OG image is auto-generated from opengraph-image.tsx in this folder
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      // Twitter image uses the OG image from opengraph-image.tsx
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  // Convert markdown to HTML if content exists
  let htmlContent = ""
  if ("content" in post && post.content) {
    htmlContent = await markdownToHtml(post.content)
  }

  // JSON-LD structured data for blog article
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Person",
      name: "Gage Krumbach",
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "Gage Krumbach",
      url: siteUrl,
    },
    url: `${siteUrl}/blog/${slug}`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${slug}`,
    },
    keywords: post.tags?.join(", "),
  }

  return (
    <ContentLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="container mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-mono">{format(new Date(post.date), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono">{post.readingTime}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>

            <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </header>

          {/* Blog Content */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            ) : (
              <div className="p-8 bg-card border border-border rounded-lg text-center">
                <p className="font-mono text-muted-foreground">
                  Blog content would be rendered here. Add markdown files to your GitHub repo to see content.
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </ContentLayout>
  )
}
