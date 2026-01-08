"use client"

import { SectionHeader } from "./section-header"
import { RepositoryContributionCard } from "./repository-contribution-card"
import type { RepositoryContribution } from "@/lib/github"

type RecentActivityProps = {
  repositories: RepositoryContribution[]
}

export function RecentActivity({ repositories }: RecentActivityProps) {
  if (!repositories || repositories.length === 0) {
    return (
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-card">
        <SectionHeader title="Contribution Activity" />
        
        <div className="max-w-3xl mx-auto">
          <div className="p-12 rounded-lg border border-border bg-background text-center">
            <p className="text-lg text-muted-foreground font-mono">
              No recent contribution activity
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-card">
      <SectionHeader title="Contribution Activity" />
      <p className="text-center text-sm text-muted-foreground mb-8 -mt-4">
        Last 6 months
      </p>
      
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 auto-rows-fr">
        {repositories.map((repo) => (
          <RepositoryContributionCard key={repo.nameWithOwner} repository={repo} />
        ))}
      </div>
    </section>
  )
}
