"use client"

import { useTheme } from "./theme-provider"
import { useMemo, useState, useEffect } from "react"
import { applyColorMapping, calculateBlendFactor } from "@/lib/color-mapping"
import { useScroll, animated } from "@react-spring/web"

export function LandscapeScene() {
  const { isDark, timeOfDay, sunPosition, moonPosition, sunTimes, moonPhase } = useTheme()

  const [bgSvgContent, setBgSvgContent] = useState<string | null>(null)
  const [mgSvgContent, setMgSvgContent] = useState<string | null>(null)
  const [fgSvgContent, setFgSvgContent] = useState<string | null>(null)
  
  // Track viewport dimensions to handle ultra-wide screens
  const [viewportRatio, setViewportRatio] = useState(1)
  
  // Handle viewport resize for ultra-wide screens
  useEffect(() => {
    const updateViewportRatio = () => {
      const ratio = window.innerWidth / window.innerHeight
      setViewportRatio(ratio)
    }
    
    updateViewportRatio()
    window.addEventListener("resize", updateViewportRatio)
    return () => window.removeEventListener("resize", updateViewportRatio)
  }, [])

  const blendFactor = useMemo(() => {
    if (!sunPosition) {
      const isNightTime = timeOfDay < 6 || timeOfDay >= 18
      return isNightTime ? 1 : 0
    }
    const sunAltDeg = (sunPosition.altitude * 180) / Math.PI
    return calculateBlendFactor(sunAltDeg)
  }, [sunPosition, timeOfDay])

  // Helper to add preserveAspectRatio for proper scaling on wide screens
  const prepareSvgForCover = (svgContent: string, layer: 'bg' | 'mg' | 'fg') => {
    // Remove fixed width/height and add preserveAspectRatio
    // xMidYMin slice = center horizontally, anchor to top, scale to cover (crop as needed)
    // This ensures no letterboxing while maintaining aspect ratio
    let modified = svgContent
      .replace(/width="[^"]*"/, 'width="100%"')
      .replace(/height="[^"]*"/, 'height="100%"')
    
    // Add or replace preserveAspectRatio
    if (modified.includes('preserveAspectRatio')) {
      modified = modified.replace(/preserveAspectRatio="[^"]*"/, 'preserveAspectRatio="xMidYMin slice"')
    } else {
      modified = modified.replace('<svg', '<svg preserveAspectRatio="xMidYMin slice"')
    }
    
    return modified
  }

  useEffect(() => {
    Promise.all([
      fetch("/paralax_background.svg").then((res) => res.text()),
      fetch("/paralax_midground.svg").then((res) => res.text()),
      fetch("/paralax_foreground.svg").then((res) => res.text()),
    ])
      .then(([bg, mg, fg]) => {
        setBgSvgContent(prepareSvgForCover(bg, 'bg'))
        setMgSvgContent(prepareSvgForCover(mg, 'mg'))
        setFgSvgContent(prepareSvgForCover(fg, 'fg'))
      })
      .catch((err) => console.error("Failed to load parallax SVGs:", err))
  }, [])

  const transformedBg = useMemo(() => {
    if (!bgSvgContent) return null
    return applyColorMapping(bgSvgContent, blendFactor)
  }, [bgSvgContent, blendFactor])

  const transformedMg = useMemo(() => {
    if (!mgSvgContent) return null
    return applyColorMapping(mgSvgContent, blendFactor)
  }, [mgSvgContent, blendFactor])

  const transformedFg = useMemo(() => {
    if (!fgSvgContent) return null
    return applyColorMapping(fgSvgContent, blendFactor)
  }, [fgSvgContent, blendFactor])

  const { scrollYProgress } = useScroll()

  const { sunPos, moonPos, showSun, showMoon, maxSunAltToday } = useMemo(() => {
    if (!sunPosition || !moonPosition || !sunTimes) {
      return {
        sunPos: { x: 50, y: 50 },
        moonPos: { x: 50, y: 50 },
        showSun: timeOfDay >= 6 && timeOfDay < 18,
        showMoon: timeOfDay < 6 || timeOfDay >= 18,
        maxSunAltToday: 0,
      }
    }

    const sunriseAzimuthDeg = sunTimes.sunriseEnd?.azimuth ? (sunTimes.sunriseEnd.azimuth * 180) / Math.PI : 90
    const sunsetAzimuthDeg = sunTimes.sunsetStart?.azimuth ? (sunTimes.sunsetStart.azimuth * 180) / Math.PI : 270

    // Horizon is approximately at 45% down the viewport
    const horizonY = 45
    // Top safe zone (sun at highest point should be around here)
    const topY = 10
    
    // Use a conservative max altitude that works for winter
    // In winter, max might be ~30°, in summer ~70°
    // Using 35° ensures winter sun at 30° is very visible
    const maxSunAlt = 35
    
    // Normalize sun position
    const sunAltitudeDeg = (sunPosition.altitude * 180) / Math.PI
    // At altitude 0° (horizon) -> horizonY%, at max altitude -> topY%
    // Clamp to ensure any altitude above maxSunAlt still shows at topY
    const normalizedAlt = Math.min(sunAltitudeDeg / maxSunAlt, 1)
    const sunY = sunAltitudeDeg <= 0 
      ? horizonY  // At or below horizon
      : horizonY - (normalizedAlt * (horizonY - topY))

    const sunAzimuthDeg = (sunPosition.azimuth * 180) / Math.PI
    const azimuthRange = sunsetAzimuthDeg - sunriseAzimuthDeg
    const sunX = ((sunAzimuthDeg - sunriseAzimuthDeg) / azimuthRange) * 100

    // Normalize moon position
    const moonAltitudeDeg = (moonPosition.altitude * 180) / Math.PI
    const maxMoonAlt = 35 // Use same range for consistency
    const normalizedMoonAlt = Math.min(moonAltitudeDeg / maxMoonAlt, 1)
    const moonY = moonAltitudeDeg <= 0
      ? horizonY
      : horizonY - (normalizedMoonAlt * (horizonY - topY))

    const moonAzimuthDeg = (moonPosition.azimuth * 180) / Math.PI
    const moonX = ((moonAzimuthDeg - sunriseAzimuthDeg) / azimuthRange) * 100

    const showSun = sunAltitudeDeg > -6
    const showMoon = moonAltitudeDeg > -6

    return {
      sunPos: { x: Math.max(-10, Math.min(110, sunX)), y: Math.max(topY, Math.min(horizonY, sunY)) },
      moonPos: { x: Math.max(-10, Math.min(110, moonX)), y: Math.max(topY, Math.min(horizonY, moonY)) },
      showSun,
      showMoon,
      maxSunAltToday: maxSunAlt,
    }
  }, [sunPosition, moonPosition, sunTimes, timeOfDay])

  const skyColors = useMemo(() => {
    if (!sunPosition) {
      const isDay = timeOfDay >= 6 && timeOfDay < 18
      return isDay
        ? { top: "#F4EED9", middle: "#F5F0E0", bottom: "#F7F2E5" }
        : { top: "#0f172a", middle: "#1e293b", bottom: "#334155" }
    }

    const sunAltDeg = (sunPosition.altitude * 180) / Math.PI

    if (sunAltDeg < -12) {
      return { top: "#0f172a", middle: "#1e293b", bottom: "#334155" }
    } else if (sunAltDeg < -6) {
      const t = (sunAltDeg + 12) / 6
      return {
        top: lerpColor("#0f172a", "#1e3a5f", t),
        middle: lerpColor("#1e293b", "#2d4a6f", t),
        bottom: lerpColor("#334155", "#4a6080", t),
      }
    } else if (sunAltDeg < 0) {
      const t = (sunAltDeg + 6) / 6
      return {
        top: lerpColor("#1e3a5f", "#4a6080", t),
        middle: lerpColor("#2d4a6f", "#d97706", t),
        bottom: lerpColor("#4a6080", "#fbbf24", t),
      }
    } else if (sunAltDeg < 6) {
      const t = sunAltDeg / 6
      return {
        top: lerpColor("#4a6080", "#EDE8D8", t),
        middle: lerpColor("#d97706", "#F0EBDB", t),
        bottom: lerpColor("#fbbf24", "#F4EED9", t),
      }
    } else if (sunAltDeg < 20) {
      const t = (sunAltDeg - 6) / 14
      return {
        top: lerpColor("#EDE8D8", "#F4EED9", t),
        middle: lerpColor("#F0EBDB", "#F5F0E0", t),
        bottom: lerpColor("#F4EED9", "#F7F2E5", t),
      }
    } else {
      return { top: "#F4EED9", middle: "#F5F0E0", bottom: "#F7F2E5" }
    }
  }, [sunPosition, timeOfDay])

  function lerpColor(color1: string, color2: string, t: number): string {
    const c1 = hexToRgb(color1)
    const c2 = hexToRgb(color2)
    const r = Math.round(c1.r + (c2.r - c1.r) * t)
    const g = Math.round(c1.g + (c2.g - c1.g) * t)
    const b = Math.round(c1.b + (c2.b - c1.b) * t)
    return `rgb(${r}, ${g}, ${b})`
  }

  function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const isNight = sunPosition ? (sunPosition.altitude * 180) / Math.PI < -6 : timeOfDay < 6 || timeOfDay >= 18

  // Rotation center at horizon center
  const rotationCenterX = 50
  const rotationCenterY = 45 // Horizon line

  const stars = useMemo(() => {
    return [...Array(400)].map((_, i) => {
      // Distribute stars across the entire sky using random-like positions
      // Use a combination of angle and distance to fill the sky dome
      const angle = (i / 400) * 360 + (Math.sin(i * 234.567) * 0.5 + 0.5) * 120
      const distance = 10 + (Math.cos(i * 345.678) * 0.5 + 0.5) * 90 // 10-100 from center
      
      // Calculate initial position on the sky dome
      const angleRad = (angle * Math.PI) / 180
      const x = rotationCenterX + Math.cos(angleRad) * distance
      const y = rotationCenterY - Math.abs(Math.sin(angleRad)) * distance * 0.45 // Only upper hemisphere

      return {
        baseAngle: angle,
        baseDistance: distance,
        baseX: x,
        baseY: y,
        size: 0.8 + (Math.sin(i * 456.789) * 0.5 + 0.5) * 2,
        opacity: 0.4 + (Math.cos(i * 567.89) * 0.5 + 0.5) * 0.6,
        twinkleDelay: (Math.sin(i * 678.901) * 0.5 + 0.5) * 4,
      }
    })
  }, [])

  const visibleStars = useMemo(() => {
    // Rotate 15 degrees per hour (360° / 24 hours)
    const rotation = timeOfDay * 15

    return stars
      .map((star) => {
        // Rotate around the center point at horizon
        const currentAngle = (star.baseAngle + rotation) % 360
        const angleRad = (currentAngle * Math.PI) / 180
        
        // Calculate rotated position
        const x = rotationCenterX + Math.cos(angleRad) * star.baseDistance
        const y = rotationCenterY - Math.abs(Math.sin(angleRad)) * star.baseDistance * 0.45

        // Only show stars above horizon
        const isVisible = y < rotationCenterY && y > -10 && x > -10 && x < 110

        return {
          ...star,
          x,
          y,
          isVisible,
        }
      })
      .filter((star) => star.isVisible)
  }, [stars, timeOfDay])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-colors duration-500"
        style={{
          background: `linear-gradient(to bottom, ${skyColors.top}, ${skyColors.middle}, ${skyColors.bottom})`,
        }}
      />

      {isNight && (
        <div className="absolute inset-0">
          {visibleStars.map((star, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.twinkleDelay}s`,
                opacity: star.opacity,
              }}
            />
          ))}
        </div>
      )}

      {showSun && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${sunPos.x}%`,
            top: `${sunPos.y}%`,
            zIndex: 5,
          }}
        >
          <div
            className="w-12 h-12 rounded-full shadow-[0_0_60px_rgba(250,214,90,0.5)] -translate-x-1/2 -translate-y-1/2"
            style={{
              background: "linear-gradient(to bottom right, #FCE588, #FAD65A)",
            }}
          />
        </div>
      )}

      {showMoon && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${moonPos.x}%`,
            top: `${moonPos.y}%`,
            zIndex: 5,
          }}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" className="-translate-x-1/2 -translate-y-1/2">
            <defs>
              <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(148,163,184,0.4)" />
                <stop offset="100%" stopColor="rgba(148,163,184,0)" />
              </radialGradient>
            </defs>

            {isNight && <circle cx="24" cy="24" r="30" fill="url(#moonGlow)" />}

            <path
              d={(() => {
                const phase = moonPhase
                const r = 24

                if (phase > 0.49 && phase < 0.51) {
                  return `M 24,0 A 24,24 0 1,1 24,48 A 24,24 0 1,1 24,0 Z`
                }

                if (phase < 0.01 || phase > 0.99) {
                  return ""
                }

                const terminatorX = Math.cos(phase * 2 * Math.PI) * r
                const isWaxing = phase < 0.5

                if (isWaxing) {
                  const sweepFlag = terminatorX < 0 ? 1 : 0
                  const absTerminatorX = Math.abs(terminatorX)
                  return `M 24,0 A ${r},${r} 0 0,1 24,48 A ${absTerminatorX},${r} 0 0,${sweepFlag} 24,0 Z`
                } else {
                  const sweepFlag = terminatorX > 0 ? 1 : 0
                  const absTerminatorX = Math.abs(terminatorX)
                  return `M 24,0 A ${r},${r} 0 0,0 24,48 A ${absTerminatorX},${r} 0 0,${sweepFlag} 24,0 Z`
                }
              })()}
              fill={isNight ? "#e2e8f0" : "rgba(220, 220, 220, 0.6)"}
            />
          </svg>
        </div>
      )}

      {transformedBg && (
        <animated.div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            // Height matches viewport to end at the fold
            height: "100vh",
            // Always start from top with slice mode handling the scaling
            top: "0",
            zIndex: 10,
            y: scrollYProgress.to((v) => v * 50),
            transform: "scaleX(-1)",
          }}
        >
          <div 
            className="w-full h-full" 
            dangerouslySetInnerHTML={{ __html: transformedBg }} 
          />
        </animated.div>
      )}

      {transformedMg && (
        <animated.div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: "100vh",
            top: "0",
            zIndex: 20,
            y: scrollYProgress.to((v) => v * 150),
            transform: "scaleX(-1)",
          }}
        >
          <div 
            className="w-full h-full" 
            dangerouslySetInnerHTML={{ __html: transformedMg }} 
          />
        </animated.div>
      )}

      {transformedFg && (
        <animated.div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: "100vh",
            top: "0",
            zIndex: 30,
            y: scrollYProgress.to((v) => v * 250),
            transform: "scaleX(-1)",
          }}
        >
          <div 
            className="w-full h-full" 
            dangerouslySetInnerHTML={{ __html: transformedFg }} 
          />
        </animated.div>
      )}
    </div>
  )
}
