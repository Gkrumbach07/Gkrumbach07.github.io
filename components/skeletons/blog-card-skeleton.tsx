export const BlogCardSkeleton = () => {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-6 transition-all animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {/* Title */}
          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
          
          {/* Date and reading time */}
          <div className="flex items-center gap-4 mt-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-4 bg-muted rounded w-20" />
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-5/6" />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-20" />
        <div className="h-6 bg-muted rounded-full w-14" />
      </div>
    </div>
  )
}

