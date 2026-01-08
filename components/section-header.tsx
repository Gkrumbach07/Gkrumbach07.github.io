import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  title: string
  className?: string
}

export function SectionHeader({ title, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center gap-4 mb-8", className)}>
      <div className="h-px flex-1 bg-border" />
      <h2 className="font-mono text-lg text-muted-foreground uppercase tracking-wider">{title}</h2>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
