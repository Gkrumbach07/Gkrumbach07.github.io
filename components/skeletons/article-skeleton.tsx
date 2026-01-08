export const ArticleSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Back link */}
      <div className="h-4 bg-muted rounded w-32 mb-8" />

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>

        {/* Title */}
        <div className="h-10 bg-muted rounded w-3/4 mb-4" />

        {/* Excerpt */}
        <div className="space-y-2">
          <div className="h-6 bg-muted rounded w-full" />
          <div className="h-6 bg-muted rounded w-5/6" />
        </div>
      </header>

      {/* Content */}
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-8 bg-muted rounded w-full mt-6" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-3/4" />
      </div>
    </div>
  )
}

