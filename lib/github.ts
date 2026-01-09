const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "octocat"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"

// Pinned project repos to feature on the homepage
const PINNED_REPOS = [
  "ambient-code/platform",
  "Gkrumbach07/bwca-pathfinder",
  "opendatahub-io/odh-dashboard",
]

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string
  html_url: string
  homepage: string
  stargazers_count: number
  forks_count: number
  language: string
  topics: string[]
  pushed_at: string
}

export interface GitHubEvent {
  id: string
  type: string
  repo: {
    name: string
    url: string
  }
  created_at: string
  payload: {
    size?: number
    commits?: { message: string }[]
    head?: string
    before?: string
    action?: string
    ref?: string
    ref_type?: string
    pull_request?: {
      title: string
      html_url: string
      state: string
      merged?: boolean
      additions?: number
      deletions?: number
    }
  }
}

export type MonthlyActivity = {
  month: string
  year: number
  commits: number
  pullRequests: number
  reviews: number
}

export type RepositoryContribution = {
  nameWithOwner: string
  url: string
  totalCommits: number
  totalPullRequestsOpen: number
  totalPullRequestsClosed: number
  totalPullRequestsMerged: number
  totalReviews: number
  monthlyActivity: MonthlyActivity[]
  commitsChange: number
  pullRequestsChange: number
  reviewsChange: number
  totalActivityChange: number
  lastActivityDate: string // ISO date string of most recent activity
  forkVariants?: RepositoryContribution[]
}

export async function getStarredRepos(): Promise<GitHubRepo[]> {
  if (!GITHUB_TOKEN) {
    console.error("GitHub token not configured")
    return []
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    }

    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/starred?per_page=20`, {
      headers,
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error(`GitHub API returned ${res.status}`)
      return []
    }
    return res.json()
  } catch (error) {
    console.error("Error fetching starred repos:", error)
    return []
  }
}

export async function getPinnedRepos(): Promise<GitHubRepo[]> {
  if (!GITHUB_TOKEN) {
    console.error("GitHub token not configured")
    return []
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    }

    const repos = await Promise.all(
      PINNED_REPOS.map(async (repoFullName) => {
        try {
          const res = await fetch(`https://api.github.com/repos/${repoFullName}`, {
            headers,
            next: { revalidate: 3600 },
          })

          if (!res.ok) {
            console.error(`Failed to fetch ${repoFullName}: ${res.status}`)
            return null
          }
          return res.json()
        } catch (error) {
          console.error(`Error fetching ${repoFullName}:`, error)
          return null
        }
      })
    )

    return repos.filter((repo): repo is GitHubRepo => repo !== null)
  } catch (error) {
    console.error("Error fetching pinned repos:", error)
    return []
  }
}

export async function getUserRepos(): Promise<GitHubRepo[]> {
  if (!GITHUB_TOKEN) {
    console.error("GitHub token not configured")
    return []
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    }

    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=50`, {
      headers,
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error(`GitHub API returned ${res.status}`)
      return []
    }
    return res.json()
  } catch (error) {
    console.error("Error fetching user repos:", error)
    return []
  }
}

export async function getRecentActivity(): Promise<GitHubEvent[]> {
  if (!GITHUB_TOKEN) {
    console.error("GitHub token not configured")
    return []
  }

  try {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    }

    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`, {
      headers,
      next: { revalidate: 1800 },
    })

    if (!res.ok) {
      console.error(`GitHub API returned ${res.status}`)
      return []
    }
    
    const events = await res.json()
    
    return events.map((event: GitHubEvent) => {
      if (event.type === 'PushEvent') {
        return {
          ...event,
          payload: {
            ...event.payload,
            size: 1,
          },
        }
      }
      return event
    })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return []
  }
}

function getMonthDateRange(monthsAgo: number): { from: string; to: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  const targetDate = new Date(year, month - monthsAgo, 1)
  const from = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
  const to = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59)
  
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  }
}

function formatMonthShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short' })
}

type MonthlyData = {
  [repoName: string]: {
    commits: number
    pullRequests: number
    reviews: number
    pullRequestsOpen: number
    pullRequestsClosed: number
    pullRequestsMerged: number
  }
}

export async function getRepositoryContributions(): Promise<RepositoryContribution[]> {
  if (!GITHUB_TOKEN) {
    console.error("GitHub token not configured")
    return []
  }

  try {
    const monthlyDataByRepo: { [month: string]: MonthlyData } = {}
    const repoUrls: { [repoName: string]: string } = {}
    const repoMetadata: { [repoName: string]: { isFork: boolean; parent: string | null } } = {}
    const repoLastActivityDate: { [repoName: string]: string } = {} // Track most recent activity date per repo
    
    // Fetch 6 months of data
    for (let monthsAgo = 0; monthsAgo < 6; monthsAgo++) {
      const { from, to } = getMonthDateRange(monthsAgo)
      const monthDate = new Date(from)
      const monthKey = `${formatMonthShort(monthDate)} ${monthDate.getFullYear()}`
      
      const query = `
        query ContributionActivity($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              commitContributionsByRepository(maxRepositories: 25) {
                repository {
                  nameWithOwner
                  url
                  isFork
                  isPrivate
                  parent {
                    nameWithOwner
                    url
                  }
                }
                contributions(first: 100) {
                  totalCount
                  nodes {
                    occurredAt
                  }
                }
              }
              
              pullRequestContributionsByRepository(maxRepositories: 25) {
                repository {
                  nameWithOwner
                  url
                  isFork
                  isPrivate
                  parent {
                    nameWithOwner
                    url
                  }
                }
                contributions(first: 100) {
                  totalCount
                  nodes {
                    occurredAt
                    pullRequest {
                      state
                      merged
                    }
                  }
                }
              }
              
              pullRequestReviewContributionsByRepository(maxRepositories: 25) {
                repository {
                  nameWithOwner
                  url
                  isFork
                  isPrivate
                  parent {
                    nameWithOwner
                    url
                  }
                }
                contributions(first: 100) {
                  totalCount
                  nodes {
                    occurredAt
                  }
                }
              }
            }
          }
        }
      `

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      }

      const res = await fetch(GITHUB_GRAPHQL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          query,
          variables: {
            username: GITHUB_USERNAME,
            from,
            to,
          },
        }),
        next: { revalidate: 1800 },
      })

      if (!res.ok) {
        console.error(`GitHub GraphQL API returned ${res.status}`)
        continue
      }

      const data = await res.json()
      
      if (data.errors) {
        console.error("GraphQL errors:", data.errors)
        continue
      }

      const collection = data.data?.user?.contributionsCollection
      
      if (!collection) {
        continue
      }

      // Initialize month data
      monthlyDataByRepo[monthKey] = {}

      // Helper: Check if repo should be included
      // Returns null if the repo should be hidden (private or user's fork)
      const shouldIncludeRepo = (repository: any) => {
        // Skip private repositories
        if (repository.isPrivate) {
          return null
        }
        
        const isFork = repository.isFork
        const isUserFork = repository.nameWithOwner.toLowerCase().startsWith(GITHUB_USERNAME.toLowerCase() + "/")
        
        // Hide user's own forks
        if (isFork && isUserFork) {
          return null
        }
        
        // Include the repo
        return {
          nameWithOwner: repository.nameWithOwner,
          url: repository.url,
        }
      }
      
      // Helper: Update the most recent activity date for a repo
      const updateLastActivityDate = (repoName: string, dateStr: string) => {
        if (!dateStr) return
        if (!repoLastActivityDate[repoName] || dateStr > repoLastActivityDate[repoName]) {
          repoLastActivityDate[repoName] = dateStr
        }
      }

      // Process commits
      collection.commitContributionsByRepository?.forEach((repo: any) => {
        const targetRepo = shouldIncludeRepo(repo.repository)
        if (!targetRepo) return // Skip private repos and user forks
        
        const repoName = targetRepo.nameWithOwner
        repoUrls[repoName] = targetRepo.url
        
        // Store metadata
        if (!repoMetadata[repoName]) {
          repoMetadata[repoName] = {
            isFork: repo.repository.isFork,
            parent: repo.repository.parent?.nameWithOwner || null,
          }
        }
        
        if (!monthlyDataByRepo[monthKey][repoName]) {
          monthlyDataByRepo[monthKey][repoName] = {
            commits: 0,
            pullRequests: 0,
            reviews: 0,
            pullRequestsOpen: 0,
            pullRequestsClosed: 0,
            pullRequestsMerged: 0,
          }
        }
        
        monthlyDataByRepo[monthKey][repoName].commits = repo.contributions.totalCount
        
        // Track most recent commit date
        repo.contributions.nodes?.forEach((node: any) => {
          if (node?.occurredAt) {
            updateLastActivityDate(repoName, node.occurredAt)
          }
        })
      })

      // Process pull requests
      collection.pullRequestContributionsByRepository?.forEach((repo: any) => {
        const targetRepo = shouldIncludeRepo(repo.repository)
        if (!targetRepo) return // Skip private repos and user forks
        
        const repoName = targetRepo.nameWithOwner
        repoUrls[repoName] = targetRepo.url
        
        // Store metadata
        if (!repoMetadata[repoName]) {
          repoMetadata[repoName] = {
            isFork: repo.repository.isFork,
            parent: repo.repository.parent?.nameWithOwner || null,
          }
        }
        
        if (!monthlyDataByRepo[monthKey][repoName]) {
          monthlyDataByRepo[monthKey][repoName] = {
            commits: 0,
            pullRequests: 0,
            reviews: 0,
            pullRequestsOpen: 0,
            pullRequestsClosed: 0,
            pullRequestsMerged: 0,
          }
        }
        
        let openCount = 0
        let closedCount = 0
        let mergedCount = 0
        
        repo.contributions.nodes?.forEach((node: any) => {
          if (!node?.pullRequest) return
          
          // Track most recent PR date
          if (node.occurredAt) {
            updateLastActivityDate(repoName, node.occurredAt)
          }
          
          if (node.pullRequest.state === "OPEN") {
            openCount++
          } else if (node.pullRequest.merged) {
            mergedCount++
          } else if (node.pullRequest.state === "CLOSED") {
            closedCount++
          }
        })
        
        monthlyDataByRepo[monthKey][repoName].pullRequests = repo.contributions.totalCount
        monthlyDataByRepo[monthKey][repoName].pullRequestsOpen = openCount
        monthlyDataByRepo[monthKey][repoName].pullRequestsClosed = closedCount
        monthlyDataByRepo[monthKey][repoName].pullRequestsMerged = mergedCount
      })

      // Process reviews
      collection.pullRequestReviewContributionsByRepository?.forEach((repo: any) => {
        const targetRepo = shouldIncludeRepo(repo.repository)
        if (!targetRepo) return // Skip private repos and user forks
        
        const repoName = targetRepo.nameWithOwner
        repoUrls[repoName] = targetRepo.url
        
        // Store metadata
        if (!repoMetadata[repoName]) {
          repoMetadata[repoName] = {
            isFork: repo.repository.isFork,
            parent: repo.repository.parent?.nameWithOwner || null,
          }
        }
        
        if (!monthlyDataByRepo[monthKey][repoName]) {
          monthlyDataByRepo[monthKey][repoName] = {
            commits: 0,
            pullRequests: 0,
            reviews: 0,
            pullRequestsOpen: 0,
            pullRequestsClosed: 0,
            pullRequestsMerged: 0,
          }
        }
        
        monthlyDataByRepo[monthKey][repoName].reviews = repo.contributions.totalCount
        
        // Track most recent review date
        repo.contributions.nodes?.forEach((node: any) => {
          if (node?.occurredAt) {
            updateLastActivityDate(repoName, node.occurredAt)
          }
        })
      })
    }

    // Transform to repository-centric structure
    const repoContributions: { [repoName: string]: RepositoryContribution } = {}
    const monthKeys = Object.keys(monthlyDataByRepo).reverse() // Oldest to newest

    Object.entries(repoUrls).forEach(([repoName, url]) => {
      const monthlyActivity: MonthlyActivity[] = []
      let totalCommits = 0
      let totalPullRequestsOpen = 0
      let totalPullRequestsClosed = 0
      let totalPullRequestsMerged = 0
      let totalReviews = 0

      // Build monthly activity array
      for (let i = 0; i < 6; i++) {
        const targetDate = new Date()
        targetDate.setMonth(targetDate.getMonth() - (5 - i))
        const monthKey = `${formatMonthShort(targetDate)} ${targetDate.getFullYear()}`
        
        const monthData = monthlyDataByRepo[monthKey]?.[repoName] || {
          commits: 0,
          pullRequests: 0,
          reviews: 0,
          pullRequestsOpen: 0,
          pullRequestsClosed: 0,
          pullRequestsMerged: 0,
        }

        monthlyActivity.push({
          month: formatMonthShort(targetDate),
          year: targetDate.getFullYear(),
          commits: monthData.commits,
          pullRequests: monthData.pullRequests,
          reviews: monthData.reviews,
        })

        totalCommits += monthData.commits
        totalReviews += monthData.reviews
        totalPullRequestsOpen += monthData.pullRequestsOpen
        totalPullRequestsClosed += monthData.pullRequestsClosed
        totalPullRequestsMerged += monthData.pullRequestsMerged
      }

      // Calculate month-over-month change (current month vs previous month)
      const currentMonth = monthlyActivity[monthlyActivity.length - 1]
      const previousMonth = monthlyActivity[monthlyActivity.length - 2]
      
      const commitsChange = currentMonth.commits - previousMonth.commits
      const pullRequestsChange = currentMonth.pullRequests - previousMonth.pullRequests
      const reviewsChange = currentMonth.reviews - previousMonth.reviews
      const totalActivityChange = 
        (currentMonth.commits + currentMonth.pullRequests + currentMonth.reviews) -
        (previousMonth.commits + previousMonth.pullRequests + previousMonth.reviews)

      repoContributions[repoName] = {
        nameWithOwner: repoName,
        url,
        totalCommits,
        totalPullRequestsOpen,
        totalPullRequestsClosed,
        totalPullRequestsMerged,
        totalReviews,
        monthlyActivity,
        commitsChange,
        pullRequestsChange,
        reviewsChange,
        totalActivityChange,
        lastActivityDate: repoLastActivityDate[repoName] || new Date(0).toISOString(),
      }
    })

    // Group repos by base name and find variants (e.g., mlflow/mlflow, org/mlflow, etc.)
    const getBaseName = (nameWithOwner: string) => {
      return nameWithOwner.split('/')[1] // e.g., "opendatahub-io/mlflow" -> "mlflow"
    }
    
    const groupedByBaseName: { [baseName: string]: string[] } = {}
    
    Object.keys(repoContributions).forEach((repoName) => {
      const baseName = getBaseName(repoName)
      if (!groupedByBaseName[baseName]) {
        groupedByBaseName[baseName] = []
      }
      groupedByBaseName[baseName].push(repoName)
    })
    
    // For each group with multiple repos, find the most active and attach variants
    Object.values(groupedByBaseName).forEach((repos) => {
      if (repos.length <= 1) return // No variants
      
      // Find the repo with the most total activity
      const findMostActive = (repoNames: string[]): string => {
        let mostActive = repoNames[0]
        let maxActivity = 0
        
        repoNames.forEach((repoName) => {
          const repo = repoContributions[repoName]
          if (!repo) return
          
          const totalActivity = 
            repo.totalCommits + 
            repo.totalPullRequestsOpen + 
            repo.totalPullRequestsClosed + 
            repo.totalPullRequestsMerged + 
            repo.totalReviews
          
          if (totalActivity > maxActivity) {
            maxActivity = totalActivity
            mostActive = repoName
          }
        })
        
        return mostActive
      }
      
      const mostActive = findMostActive(repos)
      
      // Capture full variant data before deletion
      const variants = repos
        .filter((r) => r !== mostActive)
        .map((r) => repoContributions[r])
        .filter((v): v is RepositoryContribution => v !== undefined)
      
      // Attach variants to the most active repo
      if (repoContributions[mostActive]) {
        repoContributions[mostActive].forkVariants = variants
      }
      
      // Remove the variant repos from the main list (they'll be accessible via dropdown)
      repos.forEach((repo) => {
        if (repo !== mostActive) {
          delete repoContributions[repo]
        }
      })
    })

    // Sort by most recent activity date (using actual timestamps from commits, PRs, and reviews)
    const sortedRepos = Object.values(repoContributions).sort((a, b) => {
      // Primary sort: by actual last activity date (most recent first)
      // ISO date strings can be compared lexicographically
      if (b.lastActivityDate !== a.lastActivityDate) {
        return b.lastActivityDate.localeCompare(a.lastActivityDate)
      }
      
      // Fallback: sort by total activity across all months
      const totalA = a.totalCommits + a.totalPullRequestsOpen + a.totalPullRequestsClosed + a.totalPullRequestsMerged + a.totalReviews
      const totalB = b.totalCommits + b.totalPullRequestsOpen + b.totalPullRequestsClosed + b.totalPullRequestsMerged + b.totalReviews
      return totalB - totalA
    })

    return sortedRepos
  } catch (error) {
    console.error("Error fetching contribution activity:", error)
    return []
  }
}
