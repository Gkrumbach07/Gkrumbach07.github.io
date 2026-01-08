"use client"

import type { MonthlyActivity } from "@/lib/github"

type MonthlyActivityChartProps = {
  monthlyActivity: MonthlyActivity[]
}

export function MonthlyActivityChart({ monthlyActivity }: MonthlyActivityChartProps) {
  // Find max value for scaling
  const maxValue = Math.max(
    ...monthlyActivity.flatMap((m) => [m.commits, m.pullRequests, m.reviews])
  )
  
  // Scale factor (max height is 40px)
  const scale = maxValue > 0 ? 40 / maxValue : 1

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-end justify-between gap-1 h-14">
        {monthlyActivity.map((month, idx) => {
          const commitHeight = month.commits * scale
          const prHeight = month.pullRequests * scale
          const reviewHeight = month.reviews * scale
          
          return (
            <div key={`${month.month}-${idx}`} className="flex-1 flex flex-col items-center gap-1">
              {/* Bar cluster */}
              <div className="flex items-end justify-center gap-px h-10 w-full">
                {/* Commits bar */}
                <div
                  className="w-1.5 bg-green-600 rounded-t-sm transition-all"
                  style={{ height: `${commitHeight}px` }}
                  title={`${month.commits} commits`}
                />
                {/* PRs bar */}
                <div
                  className="w-1.5 bg-purple-600 rounded-t-sm transition-all"
                  style={{ height: `${prHeight}px` }}
                  title={`${month.pullRequests} PRs`}
                />
                {/* Reviews bar */}
                <div
                  className="w-1.5 bg-blue-600 rounded-t-sm transition-all"
                  style={{ height: `${reviewHeight}px` }}
                  title={`${month.reviews} reviews`}
                />
              </div>
              {/* Month label */}
              <span className="text-[10px] text-muted-foreground font-mono">
                {month.month}
              </span>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-600 rounded-sm" />
          <span>Commits</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-600 rounded-sm" />
          <span>PRs</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-600 rounded-sm" />
          <span>Reviews</span>
        </div>
      </div>
    </div>
  )
}

