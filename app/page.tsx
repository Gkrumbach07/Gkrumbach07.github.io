import { HeroSection } from "@/components/hero-section"
import { Navigation } from "@/components/navigation"
import { FeaturedProjects } from "@/components/featured-projects"
import { RecentActivity } from "@/components/recent-activity"
import { PinnedBlogs } from "@/components/pinned-blogs"
import { Footer } from "@/components/footer"
import { getPinnedRepos, getRepositoryContributions } from "@/lib/github"
import { getPinnedPosts } from "@/lib/blog"
import type { Project } from "@/components/project-card"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gagekrumbach.com"

// JSON-LD structured data for Person schema
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gage Krumbach",
  url: siteUrl,
  jobTitle: "Software Engineer",
  worksFor: {
    "@type": "Organization",
    name: "Red Hat",
    url: "https://redhat.com",
  },
  sameAs: [
    "https://github.com/gkrumbach07",
    "https://linkedin.com/in/gage-krumbach/",
  ],
  knowsAbout: [
    "Software Engineering",
    "Kubernetes",
    "Open Source",
    "React",
    "TypeScript",
    "AI/ML",
  ],
}

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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative">
        <Navigation isHomePage />
        <HeroSection />
        <FeaturedProjects projects={featuredProjects} />
        <PinnedBlogs posts={pinnedPosts} />
        <RecentActivity repositories={repositoryContributions} />

        <Footer />
      </main>
    </>
  )
}
