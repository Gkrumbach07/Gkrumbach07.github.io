import type React from "react"
import { GitCommit, GitPullRequest, Star, GitBranch } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

export interface Activity {
  id: string
  type: string
  repo: {
    name: string
    url: string
  }
  created_at: string
  payload?: {
    commits?: { message: string }[]
    action?: string
    ref?: string
    ref_type?: string
  }
}

interface ActivityItemProps {
  activity: Activity
}

const activityIcons: Record<string, React.ReactNode> = {
  PushEvent: <GitCommit className="w-4 h-4" />,
  PullRequestEvent: <GitPullRequest className="w-4 h-4" />,
  WatchEvent: <Star className="w-4 h-4" />,
  CreateEvent: <GitBranch className="w-4 h-4" />,
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const icon = activityIcons[activity.type] || <GitCommit className="w-4 h-4" />

  const getActivityDescription = () => {
    switch (activity.type) {
      case "PushEvent":
        const commitCount = activity.payload?.commits?.length || 0
        return `Pushed ${commitCount} commit${commitCount !== 1 ? "s" : ""}`
      case "PullRequestEvent":
        return `${activity.payload?.action} a pull request`
      case "WatchEvent":
        return "Starred"
      case "CreateEvent":
        return `Created ${activity.payload?.ref_type} ${activity.payload?.ref || ""}`
      default:
        return activity.type.replace("Event", "")
    }
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
      <div className="p-2 bg-secondary rounded-md text-secondary-foreground">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-foreground">{getActivityDescription()}</span>
          <Link
            href={activity.repo.url}
            target="_blank"
            className="font-mono text-sm text-primary hover:underline truncate"
          >
            {activity.repo.name}
          </Link>
        </div>
        {activity.payload?.commits?.[0]?.message && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{activity.payload.commits[0].message}</p>
        )}
        <span className="text-xs text-muted-foreground mt-1 block">
          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}
