export const ProjectCardSkeleton = () => {
  return (
    <div className="group relative bg-card border border-border rounded-xl p-6 transition-all animate-pulse">
      <div className="flex items-start justify-between mb-3">
        {/* Project name */}
        <div className="h-5 bg-muted rounded w-2/3" />
        
        {/* Stats */}
        <div className="flex items-center gap-3">
          <div className="h-4 bg-muted rounded w-8" />
          <div className="h-4 bg-muted rounded w-8" />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-4/5" />
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 bg-muted rounded-full w-16" />
        <div className="h-6 bg-muted rounded-full w-20" />
        <div className="h-6 bg-muted rounded-full w-14" />
      </div>

      {/* Language */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-muted" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
    </div>
  )
}

