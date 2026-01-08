"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Slider } from "./ui/slider"
import { Thermometer, RotateCcw, Coffee, ChevronRight, Scale, Copy } from "lucide-react"

// Import types and utilities
import type { CoffeeBed, PourEvent, Phase } from "@/lib/pour-over/types"
import { RINGS, SECTORS, CELL_HEIGHT, getActiveRingsAtHeight, isCellInCone } from "@/lib/pour-over/types"
import { 
  createEmptyBed,
  addGroundsToBed,
  pourWaterIntoCell,
  simulatePhysicsStep,
  analyzePourPattern, 
  calculateExtraction
} from "@/lib/pour-over/physics"
import {
  formatTime,
  getCellColor,
  getCellFromPoint,
  calculateBedCells,
  calculateWaterInBed,
  calculateGroundsHeight,
  getLayerStats
} from "@/lib/pour-over/helpers"

export function PourOverSimulator() {
  const [phase, setPhase] = useState<Phase>("grind")
  
  // Grind phase
  const [grindSize, setGrindSize] = useState(50)
  const [groundsWeight, setGroundsWeight] = useState(0)
  const [isGrinding, setIsGrinding] = useState(false)
  
  // Pour phase
  const [temp, setTemp] = useState(92)
  const [waterWeight, setWaterWeight] = useState(0)
  const [contactTime, setContactTime] = useState(0)
  const [bed, setBed] = useState<CoffeeBed>(createEmptyBed)
  const [pourEvents, setPourEvents] = useState<PourEvent[]>([])
  const [firstPourTime, setFirstPourTime] = useState<number | null>(null)
  
  // Pour tracking for continuous pour
  const [isPouring, setIsPouring] = useState(false)
  const [pourPosition, setPourPosition] = useState<{ x: number; y: number } | null>(null)
  
  // Water drops animation
  const [waterDrops, setWaterDrops] = useState<Array<{ id: number; cx: number; cy: number }>>([])
  const dropIdRef = useRef(0)
  
  // Track drained coffee
  const [drainedCoffee, setDrainedCoffee] = useState(0)
  
  // Refs
  const grindIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pourIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const v60Ref = useRef<SVGSVGElement>(null)
  const totalDrainedRef = useRef(0)
  
  // Result
  const [result, setResult] = useState<ReturnType<typeof calculateExtraction> | null>(null)

  // Calculate water and grounds heights for display
  const waterInBed = useMemo(() => calculateWaterInBed(bed), [bed])
  const groundsHeight = useMemo(() => calculateGroundsHeight(bed), [bed])

  // Grind handlers
  const startGrind = useCallback(() => {
    if (phase !== "grind") return
    setIsGrinding(true)
    grindIntervalRef.current = setInterval(() => {
      setGroundsWeight(prev => Math.min(50, prev + 0.5))
    }, 50)
  }, [phase])

  const stopGrind = useCallback(() => {
    setIsGrinding(false)
    if (grindIntervalRef.current) {
      clearInterval(grindIntervalRef.current)
      grindIntervalRef.current = null
    }
  }, [])

  const advanceToPour = useCallback(() => {
    if (groundsWeight < 5) return
    setPhase("pour")
    setWaterWeight(0)
    setContactTime(0)
    
    // Initialize bed with grounds
    const emptyBed = createEmptyBed()
    const bedWithGrounds = addGroundsToBed(emptyBed, groundsWeight)
    setBed(bedWithGrounds)
    
    setPourEvents([])
    setFirstPourTime(null)
    setWaterDrops([])
    setDrainedCoffee(0)
    totalDrainedRef.current = 0
  }, [groundsWeight])

  // Pour water at current position
  const pourWater = useCallback(() => {
    if (phase !== "pour" || groundsWeight === 0 || !pourPosition) return
    
    const cell = getCellFromPoint(pourPosition.x, pourPosition.y, v60Ref.current)
    if (!cell) return
    
    const { ring, sector, svgX, svgY } = cell
    const now = Date.now()
    
    // Start timer on first pour
    if (firstPourTime === null) {
      setFirstPourTime(now)
      timerIntervalRef.current = setInterval(() => {
        setContactTime(prev => prev + 1)
      }, 1000)
    }
    
    // Add water - realistic pour rate
    // With new scale (1 unit = 2g), need 5x more units for same grams
    const pourAmount = 0.2 // Amount per cell (was 0.04 when 1 unit = 10g)
    setWaterWeight(prev => prev + pourAmount * 2) // Scale: 1 unit = 2g
    
    // Pour water into the bed
    setBed(prevBed => pourWaterIntoCell(prevBed, ring, sector, pourAmount, temp))
    
    // Record pour event
    setPourEvents(prev => [...prev, { 
      x: (svgX - 50) / 36, 
      y: (svgY - 50) / 36, 
      ring, 
      sector, 
      time: now - (firstPourTime ?? now) 
    }])
    
    // Add water drop visual
    setWaterDrops(prev => [...prev.slice(-12), { id: dropIdRef.current++, cx: svgX, cy: svgY }])
  }, [phase, groundsWeight, pourPosition, firstPourTime, temp])

  // Start pouring
  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== "pour") return
    e.preventDefault()
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setPourPosition({ x: clientX, y: clientY })
    setIsPouring(true)
  }, [phase])

  // Update pour position on move
  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isPouring || phase !== "pour") return
    e.preventDefault()
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    setPourPosition({ x: clientX, y: clientY })
  }, [isPouring, phase])

  // Stop pouring
  const handlePointerUp = useCallback(() => {
    setIsPouring(false)
    setPourPosition(null)
  }, [])

  // Continuous pour while holding
  useEffect(() => {
    if (isPouring && pourPosition) {
      pourWater()
      pourIntervalRef.current = setInterval(pourWater, 100)
    } else {
      if (pourIntervalRef.current) {
        clearInterval(pourIntervalRef.current)
        pourIntervalRef.current = null
      }
    }
    return () => {
      if (pourIntervalRef.current) {
        clearInterval(pourIntervalRef.current)
        pourIntervalRef.current = null
      }
    }
  }, [isPouring, pourPosition, pourWater])

  // Track water weight for physics calculations
  const waterWeightRef = useRef(0)
  useEffect(() => {
    waterWeightRef.current = waterWeight
  }, [waterWeight])

  // Physics simulation - run every frame
  useEffect(() => {
    if (phase !== "pour") return
    
    const physicsInterval = setInterval(() => {
      setBed(prevBed => {
        const { newBed, drained } = simulatePhysicsStep(prevBed, grindSize, 0.15)
        
        // Track drained water - accounting for grounds absorption
        if (drained > 0) {
          totalDrainedRef.current += drained * 2 // Scale: 1 unit = 2g
          
          // Grounds absorb about 2x their weight in water
          const absorption = groundsWeight * 2
          // Coffee in mug = drained - absorption, but never more than water poured - absorption
          const maxPossibleCoffee = Math.max(0, waterWeightRef.current - absorption)
          const coffeeInMug = Math.min(
            Math.max(0, totalDrainedRef.current - absorption),
            maxPossibleCoffee
          )
          
          setDrainedCoffee(coffeeInMug)
        }
        
        return newBed
      })
    }, 150)
    
    return () => clearInterval(physicsInterval)
  }, [phase, grindSize, groundsWeight])

  // Clean up water drops
  useEffect(() => {
    if (waterDrops.length === 0) return
    const timeout = setTimeout(() => {
      setWaterDrops(prev => prev.slice(1))
    }, 400)
    return () => clearTimeout(timeout)
  }, [waterDrops.length])

  // Finish brew
  const finishBrew = useCallback(() => {
    if (waterWeight < 10) return
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (pourIntervalRef.current) {
      clearInterval(pourIntervalRef.current)
      pourIntervalRef.current = null
    }
    
    const pourPattern = analyzePourPattern(pourEvents)
    const brewResult = calculateExtraction(temp, grindSize, groundsWeight, waterWeight, contactTime, bed, pourPattern, "medium")
    
    setResult(brewResult)
    setPhase("complete")
  }, [waterWeight, temp, grindSize, groundsWeight, contactTime, bed, pourEvents])

  // Reset
  const reset = useCallback(() => {
    if (grindIntervalRef.current) clearInterval(grindIntervalRef.current)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (pourIntervalRef.current) clearInterval(pourIntervalRef.current)
    
    setPhase("grind")
    setGrindSize(50)
    setGroundsWeight(0)
    setIsGrinding(false)
    setIsPouring(false)
    setPourPosition(null)
    setTemp(92)
    setWaterWeight(0)
    setContactTime(0)
    setBed(createEmptyBed())
    setPourEvents([])
    setFirstPourTime(null)
    setWaterDrops([])
    setDrainedCoffee(0)
    totalDrainedRef.current = 0
    setResult(null)
  }, [])

  // Copy debug data for LLM
  const copyDebugData = useCallback(() => {
    const debugInfo = `Pour-Over Simulator Debug Data
========================================
Phase: ${phase}
Grounds: ${groundsWeight.toFixed(1)}g (grind size: ${grindSize})
Water poured: ${waterWeight.toFixed(0)}g
Time: ${contactTime}s
Temperature: ${temp}°C
Drained coffee: ${drainedCoffee.toFixed(0)}g
WaterInBed metric: ${waterInBed.toFixed(2)}g
Content height: ${groundsHeight} / ${CELL_HEIGHT}

Sample Columns (height 0=bottom, ${CELL_HEIGHT-1}=top):
${[
  { r: 0, s: 0, label: "Center" },
  { r: 2, s: 0, label: "Mid-ring" },
].map(({ r, s, label }) => {
  const column = bed[r][s]
  return `
${label} (ring:${r} sector:${s}):
${column.map((cell, h) => 
  `  H${h}: DryG:${cell.dryGrounds.toFixed(2)}g WetG:${cell.wetGrounds.toFixed(2)}g FreeW:${cell.freeWater.toFixed(2)}g${cell.extractedSolids > 0 ? ` Extract:${cell.extractedSolids.toFixed(3)}` : ''}`
).join('\n')}
  Total dry: ${column.reduce((sum, c) => sum + c.dryGrounds, 0).toFixed(2)}g
  Total wet: ${column.reduce((sum, c) => sum + c.wetGrounds, 0).toFixed(2)}g
  Total water: ${column.reduce((sum, c) => sum + c.freeWater, 0).toFixed(2)}g`
}).join('\n')}

Layer Summary:
${Array.from({ length: CELL_HEIGHT }, (_, h) => {
  const stats = getLayerStats(bed, h)
  if (stats.dryGrounds < 0.01 && stats.wetGrounds < 0.01 && stats.freeWater < 0.01) return ''
  return `H${h}: DryG:${stats.dryGrounds.toFixed(2)}g WetG:${stats.wetGrounds.toFixed(2)}g FreeW:${stats.freeWater.toFixed(2)}g (${stats.cellCount} cells)`
}).filter(s => s).join('\n')}
`
    navigator.clipboard.writeText(debugInfo)
    alert('Debug data copied to clipboard!')
  }, [phase, groundsWeight, grindSize, waterWeight, contactTime, temp, drainedCoffee, waterInBed, groundsHeight, bed])

  // Calculate bed cells for SVG
  const bedCells = useMemo(() => 
    calculateBedCells(bed, groundsWeight, getCellColor),
    [bed, groundsWeight]
  )

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold">Pour-Over Sim</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-muted-foreground">
            {phase === "grind" ? "① Grind" : phase === "pour" ? "② Pour" : "Done"}
          </div>
          <button onClick={reset} className="p-1.5 hover:bg-muted rounded transition-colors" title="Reset">
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex gap-3">
        {/* Cross-section gauge (left) */}
        <div className="w-16 flex flex-col items-center">
          <svg viewBox="0 0 70 140" className="w-full h-full">
            <defs>
              <clipPath id="coneClip">
                <path d="M 5 12 L 35 98 L 65 12 Z" />
              </clipPath>
            </defs>
            
            {/* Labels */}
            <text x="35" y="8" textAnchor="middle" className="text-[7px] fill-muted-foreground font-mono">air</text>
            
            {/* Cone outline */}
            <path
              d="M 5 12 L 35 98 L 65 12 Z"
              fill="rgb(245, 240, 235)"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-stone-400 dark:text-stone-500"
            />
            
            {/* Vertical cross-section showing cell composition */}
            {groundsWeight > 0 && (() => {
              // Sample center column (ring 0, sector 0) for cross-section
              const centerColumn = bed[0][0]
              const coneHeight = 98 - 12 // 86px total height
              
              // Calculate mass-based occupancy for each cell
              // Mass = dryGrounds + wetGrounds + freeWater (all in grams)
              const cellMasses = centerColumn.map(cell => 
                cell.dryGrounds + cell.wetGrounds + cell.freeWater
              )
              
              // Find topmost cell with content
              let topCell = 0
              for (let h = CELL_HEIGHT - 1; h >= 0; h--) {
                if (cellMasses[h] > 0.05) {
                  topCell = h
                  break
                }
              }
              
              // Calculate total mass
              const totalMass = cellMasses.slice(0, topCell + 1).reduce((sum, m) => sum + m, 0)
              
              // Scale to use most of cone (minimum 40%, maximum 80%)
              const targetHeight = Math.max(0.4, Math.min(0.85, 0.3 + totalMass * 0.02))
              const availableHeight = coneHeight * targetHeight
              
              // Each gram gets proportional height
              const heightPerGram = totalMass > 0 ? availableHeight / totalMass : 0
              
              // Draw cells with heights proportional to their mass
              let currentY = 98 // Start from bottom
              const layers: React.JSX.Element[] = []
              
              for (let h = 0; h <= topCell; h++) {
                const cell = centerColumn[h]
                const mass = cellMasses[h]
                
                if (mass < 0.01) continue
                
                // Calculate this cell's visual height based on mass
                const cellHeight = mass * heightPerGram
                const yBottom = currentY
                const yTop = currentY - cellHeight
                
                // Calculate cone width at these heights
                const widthAtBottom = 30 * (98 - yBottom) / coneHeight
                const widthAtTop = 30 * (98 - yTop) / coneHeight
                
                // Determine cell color based on contents
                let fillColor: string
                const totalGrounds = cell.dryGrounds + cell.wetGrounds
                
                if (totalGrounds > 0.1) {
                  // Has grounds - color based on wetness
                  const wetRatio = cell.wetGrounds / (totalGrounds + 0.001)
                  const freeWaterEffect = Math.min(1, cell.freeWater / 3)
                  const totalWetness = Math.min(1, wetRatio + freeWaterEffect * 0.5)
                  
                  // Dry grounds: Light tan rgb(210, 180, 140)
                  // Wet grounds: Dark brown rgb(60, 40, 20)
                  const dryR = 210, dryG = 180, dryB = 140
                  const wetR = 60, wetG = 40, wetB = 20
                  
                  const r = Math.round(dryR - totalWetness * (dryR - wetR))
                  const g = Math.round(dryG - totalWetness * (dryG - wetG))
                  const b = Math.round(dryB - totalWetness * (dryB - wetB))
                  
                  fillColor = `rgb(${r}, ${g}, ${b})`
                } else if (cell.freeWater > 0.1) {
                  // Pure water pool - blue
                  const waterIntensity = Math.min(1, cell.freeWater / 5)
                  const r = Math.round(59 - waterIntensity * 10)
                  const g = Math.round(130 + waterIntensity * 30)
                  const b = 246
                  fillColor = `rgb(${r}, ${g}, ${b})`
                } else {
                  // Very little content
                  fillColor = "rgba(200, 200, 200, 0.2)"
                }
                
                layers.push(
                <path
                    key={h}
                    d={`M ${35 - widthAtTop} ${yTop} 
                        L ${35 - widthAtBottom} ${yBottom} 
                        L ${35 + widthAtBottom} ${yBottom} 
                        L ${35 + widthAtTop} ${yTop} Z`}
                    fill={fillColor}
                  />
                )
                
                currentY = yTop // Move up for next layer
              }
              
              return <g clipPath="url(#coneClip)">{layers}</g>
            })()}
            
            {/* Drip from cone */}
            {drainedCoffee > 2 && (
              <line x1="35" y1="98" x2="35" y2="108" stroke="rgb(80, 50, 25)" strokeWidth="2" strokeLinecap="round" />
            )}
            
            {/* Mug */}
            <rect
              x="5"
              y="108"
              width="60"
              height="28"
              fill="rgb(250, 248, 245)"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-stone-400 dark:text-stone-500"
              rx="2"
            />
            
            {/* Handle */}
            <path
              d="M 65 114 Q 72 114 72 122 Q 72 130 65 130"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-stone-400 dark:text-stone-500"
            />
            
            {/* Coffee in mug - holds 300g */}
            {drainedCoffee > 0.5 && (() => {
              const coffeeHeight = Math.min(24, (drainedCoffee / 300) * 24)
              return (
                <rect
                  x="7"
                  y={134 - coffeeHeight}
                  width="56"
                  height={coffeeHeight}
                  fill="rgb(80, 50, 25)"
                  rx="1"
                />
              )
            })()}
            
            {/* Mug label */}
            <text x="35" y="148" textAnchor="middle" className="text-[6px] fill-muted-foreground font-mono">
              {drainedCoffee > 0.5 ? `${Math.round(drainedCoffee)}g` : "mug"}
            </text>
          </svg>
        </div>

        {/* V60 Visual */}
        <div className="flex-1">
          <div 
            className={`relative aspect-square bg-stone-100 dark:bg-stone-900 rounded-lg overflow-hidden select-none ${
              phase === "pour" ? "cursor-crosshair" : ""
            }`}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            <svg ref={v60Ref} viewBox="0 0 100 100" className="w-full h-full">
              {/* Dripper edge */}
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-stone-300 dark:text-stone-600" />
              
              {/* Filter paper */}
              <circle cx="50" cy="50" r="42" fill="currentColor" className="text-stone-50 dark:text-stone-800" />
              
              {/* V60 ridges */}
              {[...Array(12)].map((_, i) => (
                <line
                  key={i}
                  x1="50" y1="50"
                  x2={50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}
                  y2={50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}
                  stroke="currentColor"
                  strokeWidth="0.3"
                  className="text-stone-200 dark:text-stone-700"
                />
              ))}
              
              {/* Coffee bed cells */}
              {bedCells.map((cell, i) => (
                <path key={i} d={cell.d} fill={cell.color} className="transition-colors duration-150" />
              ))}
              
              {/* Water drops with ripple effect */}
              {waterDrops.map(drop => (
                <g key={drop.id}>
                  <circle 
                    cx={drop.cx} 
                    cy={drop.cy} 
                    r="3" 
                    fill="rgba(59, 130, 246, 0.7)"
                  />
                  <circle 
                    cx={drop.cx} 
                    cy={drop.cy} 
                    r="2" 
                    fill="none" 
                    stroke="rgba(59, 130, 246, 0.5)" 
                    strokeWidth="1.5"
                  >
                    <animate attributeName="r" from="3" to="12" dur="0.4s" fill="freeze" />
                    <animate attributeName="opacity" from="0.6" to="0" dur="0.4s" fill="freeze" />
                  </circle>
                </g>
              ))}
              
              {/* Active pour indicator */}
              {isPouring && pourPosition && (() => {
                const cell = getCellFromPoint(pourPosition.x, pourPosition.y, v60Ref.current)
                if (!cell) return null
                return (
                  <>
                    <circle cx={cell.svgX} cy={cell.svgY} r="6" fill="rgba(59, 130, 246, 0.3)" />
                    <circle cx={cell.svgX} cy={cell.svgY} r="3" fill="rgba(59, 130, 246, 0.7)" />
                  </>
                )
              })()}
              
              {/* Center hole */}
              <circle cx="50" cy="50" r="2" fill="currentColor" className="text-stone-400 dark:text-stone-600" />
            </svg>
            
            {/* Phase overlays */}
            {phase === "grind" && groundsWeight === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-mono text-muted-foreground bg-background/90 px-2 py-1 rounded">Hold grind button</span>
              </div>
            )}
            
            {phase === "pour" && pourEvents.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs font-mono text-muted-foreground bg-background/90 px-2 py-1 rounded">Click & hold to pour</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls (right) */}
        <div className="w-28 flex flex-col gap-2">
          {/* Scale */}
          <div className="bg-muted/50 rounded-lg p-2 border border-border">
            <div className="flex items-center gap-1 mb-1">
              <Scale className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-mono text-muted-foreground">
                {phase === "grind" ? "Grounds" : "Water"}
              </span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-mono font-bold tabular-nums">
                {phase === "grind" ? groundsWeight.toFixed(1) : waterWeight.toFixed(0)}
              </span>
              <span className="text-[10px] text-muted-foreground">g</span>
            </div>
          </div>

          {/* Timer */}
          {phase !== "grind" && (
            <div className="bg-muted/50 rounded-lg p-2 border border-border">
              <span className="text-[10px] font-mono text-muted-foreground">Time</span>
              <div className="text-lg font-mono font-bold tabular-nums">{formatTime(contactTime)}</div>
            </div>
          )}

          {/* Temperature */}
          {phase === "pour" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Thermometer className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-mono">{temp}°C</span>
              </div>
              <Slider
                value={[temp]}
                min={80}
                max={100}
                step={1}
                onValueChange={([v]) => setTemp(v)}
                className="[&_[data-slot=slider-range]]:bg-amber-500"
              />
            </div>
          )}

          {/* Grind size */}
          {phase === "grind" && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-muted-foreground">Grind</span>
                <span className="text-[10px] font-mono">{grindSize < 30 ? "Fine" : grindSize < 60 ? "Med" : "Coarse"}</span>
              </div>
              <Slider
                value={[grindSize]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => setGrindSize(v)}
                className="[&_[data-slot=slider-range]]:bg-amber-500"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="mt-auto space-y-1.5">
            {phase === "grind" && (
              <>
                <button
                  onMouseDown={startGrind}
                  onMouseUp={stopGrind}
                  onMouseLeave={stopGrind}
                  onTouchStart={startGrind}
                  onTouchEnd={stopGrind}
                  className={`w-full py-1.5 rounded-lg font-medium text-[11px] transition-colors ${
                    isGrinding ? "bg-amber-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"
                  }`}
                >
                  {isGrinding ? "Grinding..." : "Hold to Grind"}
                </button>
                <button
                  onClick={advanceToPour}
                  disabled={groundsWeight < 5}
                  className="w-full py-1.5 rounded-lg font-medium text-[11px] bg-sky-600 hover:bg-sky-700 disabled:bg-muted disabled:text-muted-foreground text-white transition-colors flex items-center justify-center gap-1"
                >
                  Pour <ChevronRight className="w-3 h-3" />
                </button>
              </>
            )}

            {phase === "pour" && (
              <button
                onClick={finishBrew}
                disabled={waterWeight < 10}
                className="w-full py-1.5 rounded-lg font-medium text-[11px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-muted disabled:text-muted-foreground text-white transition-colors"
              >
                Finish Brew
              </button>
            )}

            {phase === "complete" && (
              <button
                onClick={reset}
                className="w-full py-1.5 rounded-lg font-medium text-[11px] bg-stone-600 hover:bg-stone-700 text-white transition-colors"
              >
                Brew Again
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="border-t border-border pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${
              result.quality === "optimal" ? "text-emerald-600" : result.quality === "over" ? "text-red-600" : "text-amber-600"
            }`}>
              {result.quality === "optimal" ? "Great Brew!" : result.quality === "over" ? "Over-extracted" : "Under-extracted"}
            </span>
            <span className="text-lg font-mono font-bold">{result.score}<span className="text-xs text-muted-foreground">/100</span></span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded p-1.5">
              <div className="text-[10px] text-muted-foreground">TDS</div>
              <div className="text-sm font-mono font-bold">{result.tds}%</div>
            </div>
            <div className="bg-muted/50 rounded p-1.5">
              <div className="text-[10px] text-muted-foreground">Extraction</div>
              <div className="text-sm font-mono font-bold">{result.extractionYield}%</div>
            </div>
            <div className="bg-muted/50 rounded p-1.5">
              <div className="text-[10px] text-muted-foreground">Ratio</div>
              <div className="text-sm font-mono font-bold">1:{Math.round(waterWeight / groundsWeight)}</div>
            </div>
          </div>
          
          {result.notes.length > 0 && (
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              {result.notes.map((note, i) => <p key={i}>• {note}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Debug panel - show layer statistics */}
      {phase === "pour" && (
        <div className="border-t border-border pt-3">
          <details className="text-xs" open>
            <summary className="cursor-pointer font-mono text-muted-foreground hover:text-foreground flex items-center justify-between">
              <span>Bed State</span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  copyDebugData()
                }}
                className="ml-2 p-1 hover:bg-muted rounded transition-colors"
                title="Copy debug data"
              >
                <Copy className="w-3 h-3" />
              </button>
            </summary>
            <div className="mt-2 space-y-3">
              {/* Layer statistics with new dry/wet/water model */}
              {(() => {
                // Find all layers with content
                const layers: Array<{
                  h: number
                  dryGrounds: number
                  wetGrounds: number
                  freeWater: number
                  cellCount: number
                  totalCellsAtHeight: number
                }> = []
                
                for (let h = 0; h < CELL_HEIGHT; h++) {
                  const stats = getLayerStats(bed, h)
                  
                  if (stats.dryGrounds > 0.01 || stats.wetGrounds > 0.01 || stats.freeWater > 0.01) {
                    layers.push({
                      h,
                      dryGrounds: stats.dryGrounds,
                      wetGrounds: stats.wetGrounds,
                      freeWater: stats.freeWater,
                      cellCount: stats.cellCount,
                      totalCellsAtHeight: stats.activeRings * SECTORS
                    })
                  }
                }
                
                // Calculate totals
                const totalDryGrounds = layers.reduce((sum, l) => sum + l.dryGrounds, 0)
                const totalWetGrounds = layers.reduce((sum, l) => sum + l.wetGrounds, 0)
                const totalFreeWater = layers.reduce((sum, l) => sum + l.freeWater, 0)
                // Water absorbed = wetGrounds * (2/3) since wetGrounds = grounds + 2x water
                const totalAbsorbedWater = totalWetGrounds * (2/3)
                const totalWaterInBed = totalFreeWater + totalAbsorbedWater
                
                return (
                  <>
                    {/* Show each active layer with detailed stats */}
                    {layers.map((layer) => {
                      const totalGrounds = layer.dryGrounds + layer.wetGrounds * (1/3)
                      const hasGrounds = totalGrounds > 0.5
                      
                      // Wetness = proportion of grounds that are wet
                      const wetness = (totalGrounds > 0) 
                        ? (layer.wetGrounds * (1/3)) / totalGrounds * 100
                        : 0
                      
                      // Calculate bar widths (as percentage of total mass in layer)
                      const totalMass = layer.dryGrounds + layer.wetGrounds + layer.freeWater
                      const dryPct = totalMass > 0 ? (layer.dryGrounds / totalMass * 100) : 0
                      const wetPct = totalMass > 0 ? (layer.wetGrounds / totalMass * 100) : 0
                      const waterPct = totalMass > 0 ? (layer.freeWater / totalMass * 100) : 0
                      
                      return (
                        <div key={layer.h} className="bg-muted/30 rounded p-2.5">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className={`font-mono font-bold text-[11px] ${
                                hasGrounds ? 'text-amber-700 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
                              }`}>
                                Layer H{layer.h}
                              </span>
                              <span className="text-[8px] text-muted-foreground ml-1.5">
                                ({layer.cellCount} cells)
                              </span>
                            </div>
                            {hasGrounds && (
                              <div className="text-[8px] font-mono">
                                <span className="text-muted-foreground">Wetness:</span>
                                <span className={`font-bold ml-1 ${
                                  wetness > 80 ? 'text-emerald-600 dark:text-emerald-400' : 
                                  wetness > 30 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-muted-foreground'
                                }`}>
                                  {wetness.toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Composition bar - dry grounds (tan), wet grounds (brown), water (blue) */}
                          <div className="h-4 rounded-sm overflow-hidden flex mb-2" style={{ backgroundColor: 'rgb(229, 231, 235)' }}>
                            <div 
                              className="bg-amber-200 dark:bg-amber-300"
                              style={{ width: `${dryPct}%` }}
                              title={`Dry grounds: ${layer.dryGrounds.toFixed(1)}g`}
                            />
                            <div 
                              className="bg-amber-700 dark:bg-amber-600"
                              style={{ width: `${wetPct}%` }}
                              title={`Wet grounds: ${layer.wetGrounds.toFixed(1)}g`}
                            />
                            <div 
                              className="bg-blue-500"
                              style={{ width: `${waterPct}%` }}
                              title={`Free water: ${layer.freeWater.toFixed(1)}g`}
                            />
                          </div>
                          
                          {/* Detailed numbers */}
                          <div className="grid grid-cols-3 gap-1.5 text-[8px]">
                            <div>
                              <div className="text-amber-600 dark:text-amber-300">Dry</div>
                              <div className="font-mono font-bold">{layer.dryGrounds.toFixed(1)}g</div>
                            </div>
                            <div>
                              <div className="text-amber-800 dark:text-amber-500">Wet</div>
                              <div className="font-mono font-bold">{layer.wetGrounds.toFixed(1)}g</div>
                            </div>
                            <div>
                              <div className="text-blue-600 dark:text-blue-400">Water</div>
                              <div className="font-mono font-bold">{layer.freeWater.toFixed(1)}g</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Overall Stats */}
                    <div className="bg-muted/20 rounded p-2 text-[9px] font-mono space-y-1">
                      <div className="font-bold text-[10px] mb-1.5 text-foreground">Overall Bed State</div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active layers:</span>
                        <span className="font-bold">{layers.length} / {CELL_HEIGHT}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-600 dark:text-amber-300">Dry grounds:</span>
                        <span className="font-bold">{totalDryGrounds.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-800 dark:text-amber-500">Wet grounds:</span>
                        <span className="font-bold">{totalWetGrounds.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600 dark:text-blue-400">Free water:</span>
                        <span className="font-bold">{totalFreeWater.toFixed(1)}g</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-1 mt-1">
                        <span className="text-muted-foreground">Water in bed:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{totalWaterInBed.toFixed(1)}g</span>
                  </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Drained:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{drainedCoffee.toFixed(0)}g</span>
                  </div>
                </div>
                  </>
                )
              })()}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
