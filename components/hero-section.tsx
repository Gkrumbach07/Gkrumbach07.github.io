"use client"

import { useTheme } from "./theme-provider"
import { LandscapeScene } from "./landscape-scene"
import { Sundial } from "./sundial"
import { Github } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const { isDark } = useTheme()

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Landscape background */}
      <LandscapeScene />

      {/* Sundial control - top right */}
      <div className="absolute top-6 right-6 z-50">
        <Sundial />
      </div>

      <div className="relative z-40 flex flex-col justify-start h-full px-6 md:px-12 lg:px-24 pt-12 pb-32">
        <div className={`max-w-2xl p-6 md:p-8 rounded-3xl backdrop-blur-md transition-all duration-500 ${
          isDark ? "bg-black/20 shadow-2xl shadow-black/30" : "bg-white/30 shadow-2xl shadow-black/10"
        }`}>
          <span className={`text-sm mb-2 block transition-colors duration-500 drop-shadow-lg ${
            isDark ? "text-stone-400" : "text-stone-600"
          }`}>Software Engineer</span>

          <h1
            className={`text-4xl md:text-5xl font-bold tracking-tight mb-4 transition-colors duration-500 drop-shadow-lg ${
              isDark ? "text-stone-100" : "text-stone-900"
            }`}
          >
            Gage Krumbach
          </h1>

          <p
            className={`text-base md:text-lg leading-relaxed mb-8 max-w-xl transition-colors duration-500 drop-shadow ${
              isDark ? "text-stone-300" : "text-stone-700"
            }`}
          >
            I am a software engineer building open, Kubernetes native AI platforms and developer tooling, frontend-fluent.
          </p>
          <div className="flex flex-wrap items-center gap-3">

            <Link
              href="https://github.com/gkrumbach07"
              target="_blank"
              className={`p-2 rounded-md transition-colors ${
                isDark ? "hover:bg-white/10 text-stone-300" : "hover:bg-black/5 text-stone-700"
              }`}
              aria-label="GitHub Profile"
            >
              <Github className="w-5 h-5" />
            </Link>

            <div
              className={`h-5 w-px transition-colors ${isDark ? "bg-stone-400" : "bg-stone-400"}`}
              aria-hidden="true"
            />

            <nav className="flex items-center gap-1">
              <Link
                href="/blog"
                className={`px-3 py-2 text-sm font-mono rounded-md transition-colors ${
                  isDark ? "text-stone-300 hover:bg-white/10" : "text-stone-700 hover:bg-black/5"
                }`}
              >
                Blog
              </Link>
              <Link
                href="/about"
                className={`px-3 py-2 text-sm font-mono rounded-md transition-colors ${
                  isDark ? "text-stone-300 hover:bg-white/10" : "text-stone-700 hover:bg-black/5"
                }`}
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex flex-col items-center gap-2">
          <span className={`font-mono text-xs transition-colors duration-500 ${
            isDark ? "text-stone-400" : "text-white/80"
          }`}>scroll</span>
          <div className={`w-5 h-8 rounded-full border-2 flex justify-center pt-1.5 transition-colors duration-500 ${
            isDark ? "border-stone-400/50" : "border-white/40"
          }`}>
            <div className={`w-1 h-2 rounded-full animate-bounce transition-colors duration-500 ${
              isDark ? "bg-stone-400/50" : "bg-white/60"
            }`} />
          </div>
        </div>
      </div>
    </section>
  )
}
