import { Star, GitFork, ExternalLink } from "lucide-react"
import Link from "next/link"

export interface Project {
  id: number
  name: string
  description: string
  html_url: string
  homepage?: string
  stargazers_count: number
  forks_count: number
  language?: string
  topics?: string[]
}

interface ProjectCardProps {
  project: Project
  featured?: boolean
}

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Java: "bg-red-500",
  Shell: "bg-emerald-500",
}

export function ProjectCard({ project, featured }: ProjectCardProps) {
  return (
    <div
      className={`group relative flex flex-col p-6 bg-card border border-border rounded-lg transition-all duration-300 hover:border-primary/50 hover:shadow-lg ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-mono font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center gap-2">
          {project.homepage && (
            <Link
              href={project.homepage}
              target="_blank"
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`Visit ${project.name} website`}
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          <Link
            href={project.html_url}
            target="_blank"
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`View ${project.name} on GitHub`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4">
        {project.description || "No description available"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {project.language && (
            <div className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${languageColors[project.language] || "bg-gray-500"}`} />
              <span className="text-xs font-mono text-muted-foreground">{project.language}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Star className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">{project.stargazers_count}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <GitFork className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">{project.forks_count}</span>
          </div>
        </div>
      </div>

      {/* Topics */}
      {project.topics && project.topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {project.topics.slice(0, 4).map((topic) => (
            <span key={topic} className="px-2 py-0.5 text-xs font-mono bg-secondary text-secondary-foreground rounded">
              {topic}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
