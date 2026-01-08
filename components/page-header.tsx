import { Terminal } from "lucide-react"
import type React from "react"

type PageHeaderProps = {
  path: string
  title: string
  description: string
  actions?: React.ReactNode
}

export const PageHeader = ({ path, title, description, actions }: PageHeaderProps) => {
  return (
    <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
      <div className="container mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm text-muted-foreground">~/{path}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
          </div>

          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </section>
  )
}

