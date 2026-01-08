import Link from "next/link"
import { Calendar, ArrowRight } from "lucide-react"
import { format } from "date-fns"

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  pinned?: boolean
}

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block p-6 bg-card border border-border rounded-lg transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{format(new Date(post.date), "MMM d, yyyy")}</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{post.readingTime}</span>
        {post.pinned && (
          <span className="px-2 py-0.5 text-xs font-mono bg-primary/10 text-primary rounded">pinned</span>
        )}
      </div>

      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
        {post.title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>

      <div className="flex items-center gap-1 text-sm font-mono text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Read more
        <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}
