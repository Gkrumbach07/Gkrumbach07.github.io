"use client"

import { useState } from "react"
import Link from "next/link"
import type { RepositoryContribution } from "@/lib/github"
import { MonthlyActivityChart } from "./monthly-activity-chart"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, GitCommit, GitPullRequest, Eye } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type RepositoryContributionCardProps = {
  repository: RepositoryContribution
}

function ChangeIndicator({ change }: { change: number }) {
  if (change === 0) return null
  
  const isPositive = change > 0
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`text-xs font-medium flex items-center gap-0.5 cursor-help ${isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? "+" : ""}{change}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Change in activity since last month</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function RepositoryContributionCard({ repository }: RepositoryContributionCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  
  const hasVariants = repository.forkVariants && repository.forkVariants.length > 0
  
  // Get the currently displayed repository data
  const currentRepo = selectedVariant 
    ? repository.forkVariants?.find(v => v.nameWithOwner === selectedVariant) || repository
    : repository
  
  const totalPRs =
    currentRepo.totalPullRequestsOpen +
    currentRepo.totalPullRequestsClosed +
    currentRepo.totalPullRequestsMerged

  return (
    <div className="border border-border rounded-lg p-6 bg-background hover:border-primary/50 transition-colors flex flex-col h-full">
      {/* Repository name with total activity change */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={currentRepo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          {currentRepo.nameWithOwner}
        </Link>
        <ChangeIndicator change={currentRepo.totalActivityChange} />
      </div>

      {/* Metrics - each on own line */}
      <div className="space-y-2">
        {/* Commits */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Commits</span>
          <span className="text-xl font-bold text-foreground">{currentRepo.totalCommits}</span>
        </div>

        {/* Pull Requests */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Pull Requests</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {currentRepo.totalPullRequestsOpen > 0 && (
                <Badge className="h-5 rounded-full px-2 bg-green-500 hover:bg-green-500 dark:bg-green-600 dark:hover:bg-green-600 text-white">
                  <span className="font-mono tabular-nums font-semibold">{currentRepo.totalPullRequestsOpen}</span>
                  <span className="ml-1">open</span>
                </Badge>
              )}
              {currentRepo.totalPullRequestsClosed > 0 && (
                <Badge className="h-5 rounded-full px-2 bg-red-500 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-600 text-white">
                  <span className="font-mono tabular-nums font-semibold">{currentRepo.totalPullRequestsClosed}</span>
                  <span className="ml-1">closed</span>
                </Badge>
              )}
              {currentRepo.totalPullRequestsMerged > 0 && (
                <Badge className="h-5 rounded-full px-2 bg-purple-500 hover:bg-purple-500 dark:bg-purple-600 dark:hover:bg-purple-600 text-white">
                  <span className="font-mono tabular-nums font-semibold">{currentRepo.totalPullRequestsMerged}</span>
                  <span className="ml-1">merged</span>
                </Badge>
              )}
            </div>
            <span className="text-xl font-bold text-foreground">{totalPRs}</span>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reviews</span>
          <span className="text-xl font-bold text-foreground">{currentRepo.totalReviews}</span>
        </div>
      </div>

      {/* Spacer to push chart to bottom */}
      <div className="flex-grow" />

      {/* Monthly activity chart */}
      <MonthlyActivityChart monthlyActivity={currentRepo.monthlyActivity} />
      
      {/* Footer with repo switcher (only if variants exist) */}
      {hasVariants && (
        <div className="mt-4 pt-4 border-t border-border">
          <Select value={selectedVariant || repository.nameWithOwner} onValueChange={setSelectedVariant}>
            <SelectTrigger className="w-full text-xs h-8 hover:bg-accent">
              <SelectValue>
                <span className="font-mono">{selectedVariant || repository.nameWithOwner}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-[400px]">
              <SelectItem 
                value={repository.nameWithOwner}
                className="focus:bg-accent/80 data-[state=checked]:bg-accent"
              >
                <div className="flex items-center justify-between gap-6 w-full">
                  <span className="font-mono text-xs">{repository.nameWithOwner}</span>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3" />
                      <span>{repository.totalCommits}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitPullRequest className="w-3 h-3" />
                      <span>{repository.totalPullRequestsOpen + repository.totalPullRequestsClosed + repository.totalPullRequestsMerged}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{repository.totalReviews}</span>
                    </div>
                  </div>
                </div>
              </SelectItem>
              {repository.forkVariants?.map((variant) => {
                const variantTotalPRs = variant.totalPullRequestsOpen + variant.totalPullRequestsClosed + variant.totalPullRequestsMerged
                return (
                  <SelectItem 
                    key={variant.nameWithOwner} 
                    value={variant.nameWithOwner}
                    className="focus:bg-accent/80 data-[state=checked]:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-6 w-full">
                      <span className="font-mono text-xs">{variant.nameWithOwner}</span>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <GitCommit className="w-3 h-3" />
                          <span>{variant.totalCommits}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GitPullRequest className="w-3 h-3" />
                          <span>{variantTotalPRs}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{variant.totalReviews}</span>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p className="text-[10px] italic text-muted-foreground mt-2">
            {repository.forkVariants?.length === 1 
              ? "1 other owner/fork" 
              : `${repository.forkVariants?.length} other owners/forks`}
          </p>
        </div>
      )}
    </div>
  )
}

