"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "./theme-provider"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
]

export function Navigation({ isHomePage = false }: { isHomePage?: boolean }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(!isHomePage)
  const { themeMode, setThemeMode, isDark } = useTheme()

  useEffect(() => {
    if (!isHomePage) {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.8)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-border",
        isVisible ? "translate-y-0 bg-background/80 backdrop-blur-md" : "-translate-y-full",
      )}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        <Link href="/" className="font-mono text-xs md:text-sm font-bold text-foreground hover:text-primary transition-colors">
          $ gkrumbach
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* Nav Items */}
          <div className="flex items-center gap-0.5 md:gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "px-2 md:px-4 py-1.5 md:py-2 rounded-md font-mono text-xs md:text-sm transition-all duration-200",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-0.5 p-0.5 md:p-1 rounded-lg bg-muted/50 border border-border">
            <button
              onClick={() => setThemeMode("day")}
              className={cn(
                "p-1 md:p-1.5 rounded-md transition-all duration-200",
                themeMode === "day"
                  ? "bg-amber-100 text-amber-600 shadow-sm dark:bg-amber-900/50 dark:text-amber-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-95"
              )}
              title="Day mode (noon)"
              aria-label="Set day mode"
            >
              <Sun className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <button
              onClick={() => setThemeMode("night")}
              className={cn(
                "p-1 md:p-1.5 rounded-md transition-all duration-200",
                themeMode === "night"
                  ? "bg-indigo-100 text-indigo-600 shadow-sm dark:bg-indigo-900/50 dark:text-indigo-400"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50 active:scale-95"
              )}
              title="Night mode (midnight)"
              aria-label="Set night mode"
            >
              <Moon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
