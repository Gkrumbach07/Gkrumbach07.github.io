"use client"

import { SectionHeader } from "./section-header"
import { ProjectCard, type Project } from "./project-card"

type FeaturedProjectsProps = {
  projects: Project[]
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-24 bg-background">
      <SectionHeader title="Featured Projects" />

      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.slice(0, 4).map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
