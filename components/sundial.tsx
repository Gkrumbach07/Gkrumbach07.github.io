"use client"

import { useTheme } from "./theme-provider"
import { Slider } from "./ui/slider"
import { Calendar } from "./ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { CalendarIcon, RotateCcw, MapPin } from "lucide-react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

export function Sundial() {
  const {
    timeOfDay,
    setTimeOfDay,
    isManualOverride,
    setManualOverride,
    sunPosition,
    sunTimes,
    selectedDate,
    setSelectedDate,
    setThemeMode,
    requestLocation,
    hasLocationPermission,
    location,
  } = useTheme()

  // ... existing code for sunArc, sunVerticalOffset, handleValueChange ...

  const sunArc = useMemo(() => {
    if (!sunTimes) return null

    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60

    const dayLength = sunset - sunrise
    const arcLookup: { [key: string]: number } = {}

    for (let hour = 0; hour <= 24; hour += 0.1) {
      let verticalOffset = 0

      if (hour >= sunrise && hour <= sunset) {
        const progress = (hour - sunrise) / dayLength
        verticalOffset = -20 * Math.sin(progress * Math.PI)
      } else {
        verticalOffset = 0
      }

      arcLookup[hour.toFixed(1)] = verticalOffset
    }

    return arcLookup
  }, [sunTimes])

  const handleValueChange = (value: number[]) => {
    setTimeOfDay(value[0])
    if (!isManualOverride) {
      setManualOverride(true)
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time)
    const minutes = Math.floor((time % 1) * 60)
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
  }

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
    }
  }

  const handleSync = () => {
    setThemeMode("auto") // This will reset to current time and clear manual override
  }

  const handleLocationToggle = () => {
    requestLocation()
  }

  const formatLocation = (lat: number, lon: number) => {
    const latDir = lat >= 0 ? 'N' : 'S'
    const lonDir = lon >= 0 ? 'E' : 'W'
    return `${Math.abs(lat).toFixed(2)}°${latDir}, ${Math.abs(lon).toFixed(2)}°${lonDir}`
  }

  const getLocationTooltip = () => {
    if (hasLocationPermission && location) {
      return `Using location: ${formatLocation(location.lat, location.lon)} (click to turn off)`
    }
    return "Calculate sun position from your current location"
  }

  const sunrisePos = sunTimes ? ((sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60) / 24) * 100 : 25
  const sunsetPos = sunTimes ? ((sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60) / 24) * 100 : 75

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
      {/* Compact slider */}
      <div className="w-32 relative py-2">
        {/* Background gradient bar */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, 
              hsl(220, 40%, 20%) 0%, 
              hsl(40, 80%, 70%) ${sunrisePos}%, 
              hsl(200, 80%, 70%) ${(sunrisePos + sunsetPos) / 2}%, 
              hsl(30, 80%, 60%) ${sunsetPos}%, 
              hsl(220, 40%, 20%) 100%)`,
          }}
        />

        {/* Sunrise marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${sunrisePos}%` }}
        >
          <div className="w-px h-2.5 bg-stone-400/60" />
        </div>

        {/* Sunset marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${sunsetPos}%` }}
        >
          <div className="w-px h-2.5 bg-stone-500/60" />
        </div>

        {/* Slider */}
        <Slider
          value={[timeOfDay]}
          onValueChange={handleValueChange}
          min={0}
          max={24}
          step={0.01}
          className="relative z-20 [&_[data-slot=slider-track]]:bg-stone-300/50 [&_[data-slot=slider-track]]:h-1 [&_[data-slot=slider-range]]:bg-stone-400/70 [&_[data-slot=slider-thumb]]:border-stone-400 [&_[data-slot=slider-thumb]]:bg-stone-50 [&_[data-slot=slider-thumb]]:size-3.5 [&_[data-slot=slider-thumb]]:shadow-md [&_[data-slot=slider-thumb]]:transition-none"
          aria-label="Time of day control"
        />
      </div>

      {/* Date picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button className={cn(
            "flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-md",
            "transition-all duration-200",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-stone-200/50 dark:hover:bg-stone-700/50",
            "hover:scale-105 active:scale-95"
          )}>
            <CalendarIcon className="size-3" />
            <span>{formatDateShort(selectedDate)}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
        </PopoverContent>
      </Popover>

      {/* Time display */}
      <span className="text-xs font-mono text-foreground min-w-[70px]">{formatTime(timeOfDay)}</span>

      {/* Sync/reset button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleSync}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              "hover:scale-105 active:scale-95",
              isManualOverride 
                ? "text-primary hover:bg-primary/10 hover:shadow-sm" 
                : "text-muted-foreground hover:text-foreground hover:bg-stone-200/50 dark:hover:bg-stone-700/50"
            )}
            aria-label="Sync to current time"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sync to current time and reset date</p>
        </TooltipContent>
      </Tooltip>

      {/* Location toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleLocationToggle}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              "hover:scale-105 active:scale-95",
              "relative",
              hasLocationPermission 
                ? "text-primary bg-primary/10 hover:bg-primary/20 shadow-sm ring-1 ring-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-stone-200/50 dark:hover:bg-stone-700/50"
            )}
            aria-label="Toggle location-based calculations"
          >
            <MapPin className={cn(
              "size-3.5 transition-all",
              hasLocationPermission && "fill-primary/20"
            )} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getLocationTooltip()}</p>
        </TooltipContent>
      </Tooltip>
      </div>
    </TooltipProvider>
  )
}
