import { HeroSection } from "@/components/hero-section"
import { Navigation } from "@/components/navigation"
import { FeaturedProjects } from "@/components/featured-projects"
import { RecentActivity } from "@/components/recent-activity"
import { PinnedBlogs } from "@/components/pinned-blogs"
import { Footer } from "@/components/footer"
import { getPinnedRepos, getRepositoryContributions } from "@/lib/github"
import { getPinnedPosts } from "@/lib/blog"
import type { Project } from "@/components/project-card"

export default async function Home() {
  const [pinnedRepos, repositoryContributions, pinnedPosts] = await Promise.all([
    getPinnedRepos(),
    getRepositoryContributions(),
    getPinnedPosts(),
  ])

  const featuredProjects: Project[] = pinnedRepos.map((repo) => ({
    id: repo.id,
    name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    homepage: repo.homepage,
    stargazers_count: repo.stargazers_count,
    forks_count: repo.forks_count,
    language: repo.language,
    topics: repo.topics,
  }))

  return (
    <main className="relative">
      <Navigation isHomePage />
      <HeroSection />
      <FeaturedProjects projects={featuredProjects} />
      <PinnedBlogs posts={pinnedPosts} />
      <RecentActivity repositories={repositoryContributions} />

      <Footer />
    </main>
  )
}
