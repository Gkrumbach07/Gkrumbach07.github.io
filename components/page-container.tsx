import type React from "react"

type PageContainerProps = {
  children: React.ReactNode
  className?: string
}

export const PageContainer = ({ children, className = "" }: PageContainerProps) => {
  return <div className={`container mx-auto ${className}`}>{children}</div>
}

