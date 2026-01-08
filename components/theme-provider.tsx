"use client"

import type * as React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import SunCalc from "suncalc3"

type ThemeMode = "auto" | "day" | "night"

interface ThemeContextType {
  timeOfDay: number
  setTimeOfDay: (time: number) => void
  isDark: boolean
  isManualOverride: boolean
  setManualOverride: (override: boolean) => void
  sunPosition: { altitude: number; azimuth: number } | null
  moonPosition: { altitude: number; azimuth: number } | null
  moonPhase: number
  sunTimes: {
    sunrise: Date
    sunset: Date
    dawn: Date
    dusk: Date
    sunriseEnd?: { azimuth: number }
    sunsetStart?: { azimuth: number }
  } | null
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  requestLocation: () => void
  hasLocationPermission: boolean
  location: { lat: number; lon: number } | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [timeOfDay, setTimeOfDayState] = useState(12)
  const [isManualOverride, setManualOverride] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [hasLocationPermission, setHasLocationPermission] = useState(false)
  const [sunPosition, setSunPosition] = useState<{ altitude: number; azimuth: number } | null>(null)
  const [moonPosition, setMoonPosition] = useState<{ altitude: number; azimuth: number } | null>(null)
  const [moonPhase, setMoonPhase] = useState(0)
  const [sunTimes, setSunTimes] = useState<{
    sunrise: Date
    sunset: Date
    dawn: Date
    dusk: Date
    sunriseEnd?: { azimuth: number }
    sunsetStart?: { azimuth: number }
  } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [themeMode, setThemeModeState] = useState<ThemeMode>("auto")

  // Load theme mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("themeMode") as ThemeMode | null
      if (savedMode && ["auto", "day", "night"].includes(savedMode)) {
        setThemeModeState(savedMode)
      }
    }
  }, [])

  // Save theme mode to localStorage
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode)
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", mode)
    }
    
    // Apply the mode
    if (mode === "day") {
      setTimeOfDayState(12) // Noon
      setManualOverride(true)
    } else if (mode === "night") {
      setTimeOfDayState(0) // Midnight
      setManualOverride(true)
    } else {
      // Auto mode - sync to current time
      setManualOverride(false)
      const now = new Date()
      const hour = now.getHours() + now.getMinutes() / 60
      setTimeOfDayState(hour)
      setSelectedDate(now)
    }
  }, [])

  // Toggle location permission
  const requestLocation = useCallback(() => {
    // If already using location, turn it off
    if (hasLocationPermission) {
      setLocation({ lat: 39.8283, lon: -98.5795 })
      setHasLocationPermission(false)
      return
    }

    // Otherwise, request location permission
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
          setHasLocationPermission(true)
        },
        () => {
          // Fallback to approximate center of US if geolocation fails
          setLocation({ lat: 39.8283, lon: -98.5795 })
          setHasLocationPermission(false)
        },
      )
    }
  }, [hasLocationPermission])

  // Initialize with fallback location
  useEffect(() => {
    // Start with fallback location
    setLocation({ lat: 39.8283, lon: -98.5795 })
  }, [])

  useEffect(() => {
    if (!location) return

    const updateAstronomicalData = () => {
      const currentDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        Math.floor(timeOfDay),
        (timeOfDay % 1) * 60,
      )

      // Calculate sun position
      const sunPos = SunCalc.getPosition(currentDate, location.lat, location.lon)
      setSunPosition({
        altitude: sunPos.altitude,
        azimuth: sunPos.azimuth,
      })

      // Calculate moon position
      const moonPos = SunCalc.getMoonPosition(currentDate, location.lat, location.lon)
      setMoonPosition({
        altitude: moonPos.altitude,
        azimuth: moonPos.azimuth,
      })

      // Calculate moon phase
      const moonIllum = SunCalc.getMoonIllumination(currentDate)
      setMoonPhase(moonIllum.phaseValue)

      // Calculate sun times for the selected date
      const times = SunCalc.getSunTimes(currentDate, location.lat, location.lon)
      setSunTimes({
        sunrise: times.sunriseStart.value,
        sunset: times.sunsetEnd.value,
        dawn: times.civilDawn.value,
        dusk: times.civilDusk.value,
        sunriseEnd: times.sunriseEnd ? { azimuth: SunCalc.getPosition(times.sunriseEnd.value, location.lat, location.lon).azimuth } : undefined,
        sunsetStart: times.sunsetStart ? { azimuth: SunCalc.getPosition(times.sunsetStart.value, location.lat, location.lon).azimuth } : undefined,
      })
    }

    updateAstronomicalData()

    // Update astronomical data every minute
    const interval = setInterval(updateAstronomicalData, 60000)
    return () => clearInterval(interval)
  }, [location, timeOfDay, selectedDate])

  const isDark = sunPosition ? sunPosition.altitude < 0 : timeOfDay < 6 || timeOfDay >= 18

  // Sync to local time on mount
  useEffect(() => {
    setMounted(true)
    
    // Check localStorage for saved theme mode
    const savedMode = localStorage.getItem("themeMode") as ThemeMode | null
    if (savedMode === "day") {
      setTimeOfDayState(12)
      setManualOverride(true)
    } else if (savedMode === "night") {
      setTimeOfDayState(0)
      setManualOverride(true)
    } else {
      // Auto mode or no saved mode - use current time
      const now = new Date()
      const hour = now.getHours() + now.getMinutes() / 60
      setTimeOfDayState(hour)
      setSelectedDate(now)
      setManualOverride(false)
    }
  }, [])

  // Update time every minute if not manually overridden
  useEffect(() => {
    if (isManualOverride) return

    const interval = setInterval(() => {
      const now = new Date()
      const hour = now.getHours() + now.getMinutes() / 60
      setTimeOfDayState(hour)
      setSelectedDate(now)
    }, 60000)

    return () => clearInterval(interval)
  }, [isManualOverride])

  // Apply dark class to document
  useEffect(() => {
    if (!mounted) return

    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark, mounted])

  const setTimeOfDay = useCallback((time: number) => {
    setTimeOfDayState(time)
    setManualOverride(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <ThemeContext.Provider
        value={{
          timeOfDay: 12,
          setTimeOfDay,
          isDark: false,
          isManualOverride: false,
          setManualOverride,
          sunPosition: null,
          moonPosition: null,
          moonPhase: 0,
          sunTimes: null,
          selectedDate: new Date(),
          setSelectedDate,
          themeMode: "auto",
          setThemeMode,
          requestLocation,
          hasLocationPermission: false,
          location: null,
        }}
      >
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider
      value={{
        timeOfDay,
        setTimeOfDay,
        isDark,
        isManualOverride,
        setManualOverride,
        sunPosition,
        moonPosition,
        moonPhase,
        sunTimes,
        selectedDate,
        setSelectedDate,
        themeMode,
        setThemeMode,
        requestLocation,
        hasLocationPermission,
        location,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
