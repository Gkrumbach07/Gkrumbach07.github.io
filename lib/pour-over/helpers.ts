// ============================================================================
// POUR-OVER SIMULATOR HELPERS - Physics-based model with dry/wet grounds
// ============================================================================

import { 
  CellContents, 
  CoffeeBed, 
  RINGS, 
  SECTORS, 
  CELL_HEIGHT,
  getActiveRingsAtHeight,
  getTotalGrounds,
  getTotalWater
} from "./types"

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function getCellColor(column: CellContents[], hasGrounds: boolean): string {
  if (!hasGrounds) return "transparent"
  
  // Look at the topmost cell with content to determine color
  for (let h = CELL_HEIGHT - 1; h >= 0; h--) {
    const cell = column[h]
    const totalGrounds = cell.dryGrounds + cell.wetGrounds
    const totalMass = totalGrounds + cell.freeWater
    
    if (totalMass < 0.05) continue // Skip empty cells
    
    // Calculate water ratio: how much of this cell is water vs grounds
    const waterRatio = cell.freeWater / (totalMass + 0.001)
    
    // If mostly water (>70%), show blue water pool
    if (waterRatio > 0.7) {
      // Blue water - might have some grounds suspended
      const waterIntensity = Math.min(1, cell.freeWater / 3)
      const groundsTint = Math.min(0.3, totalGrounds / 5) // Slight brown tint from grounds
      
      const r = Math.round(59 + groundsTint * 100)
      const g = Math.round(130 + waterIntensity * 30 - groundsTint * 30)
      const b = Math.round(246 - groundsTint * 100)
      return `rgb(${r}, ${g}, ${b})`
    }
    
    // If mix of water and grounds (30-70% water), show slurry
    if (waterRatio > 0.3) {
      // Slurry - brownish blue
      const blueAmount = (waterRatio - 0.3) / 0.4 // 0 to 1 as waterRatio goes 0.3 to 0.7
      const r = Math.round(80 + (1 - blueAmount) * 50)
      const g = Math.round(100 + blueAmount * 30)
      const b = Math.round(140 + blueAmount * 80)
      return `rgb(${r}, ${g}, ${b})`
    }
    
    // Mostly grounds (<30% water) - brown based on wetness
    if (totalGrounds > 0.05) {
      // Calculate wetness: ratio of wet grounds to total grounds
      const wetRatio = cell.wetGrounds / (totalGrounds + 0.001)
      
      // Also consider free water
      const freeWaterEffect = Math.min(0.3, cell.freeWater / totalGrounds)
      const totalWetness = Math.min(1, wetRatio + freeWaterEffect)
      
      // Dry grounds: Light tan rgb(210, 180, 140)
      // Wet grounds: Dark brown rgb(60, 40, 20)
      const dryR = 210, dryG = 180, dryB = 140
      const wetR = 60, wetG = 40, wetB = 20
      
      const r = Math.round(dryR - totalWetness * (dryR - wetR))
      const g = Math.round(dryG - totalWetness * (dryG - wetG))
      const b = Math.round(dryB - totalWetness * (dryB - wetB))
      
      return `rgb(${r}, ${g}, ${b})`
    }
  }
  
  // Empty column - filter paper color
  return "rgba(245, 240, 235, 0.3)"
}

export function getCellFromPoint(
  clientX: number,
  clientY: number,
  svgElement: SVGSVGElement | null
): { ring: number; sector: number; svgX: number; svgY: number } | null {
  if (!svgElement) return null
  
  const svgRect = svgElement.getBoundingClientRect()
  const normalizedX = (clientX - svgRect.left) / svgRect.width
  const normalizedY = (clientY - svgRect.top) / svgRect.height
  const svgX = normalizedX * 100
  const svgY = normalizedY * 100
  
  const dx = svgX - 50
  const dy = svgY - 50
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  const maxRadius = 36
  if (distance > maxRadius) return null
  
  const ring = Math.min(RINGS - 1, Math.floor((distance / maxRadius) * RINGS))
  
  // Calculate angle - need to match the drawing coordinate system
  // Drawing starts at top (- Math.PI / 2), so we adjust for that
  const angle = Math.atan2(dy, dx) - Math.PI / 2
  const normalizedAngle = ((angle + Math.PI) / (2 * Math.PI) + 1) % 1
  const sector = Math.max(0, Math.min(SECTORS - 1, Math.floor(normalizedAngle * SECTORS)))
  
  return { ring, sector, svgX, svgY }
}

export function calculateBedCells(
  bed: CoffeeBed,
  groundsWeight: number,
  getCellColorFn: (column: CellContents[], hasGrounds: boolean) => string
): Array<{ d: string; color: string; ring: number; sector: number }> {
  const cells: Array<{ d: string; color: string; ring: number; sector: number }> = []
  
  const hasGrounds = groundsWeight > 0
  const maxRadius = 36
  const ringWidth = maxRadius / RINGS
  const sectorAngle = (2 * Math.PI) / SECTORS
  
  for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SECTORS; s++) {
      const innerRadius = r * ringWidth
      const outerRadius = (r + 1) * ringWidth
      const startAngle = s * sectorAngle - Math.PI / 2
      const endAngle = (s + 1) * sectorAngle - Math.PI / 2
      
      const x1 = 50 + innerRadius * Math.cos(startAngle)
      const y1 = 50 + innerRadius * Math.sin(startAngle)
      const x2 = 50 + outerRadius * Math.cos(startAngle)
      const y2 = 50 + outerRadius * Math.sin(startAngle)
      const x3 = 50 + outerRadius * Math.cos(endAngle)
      const y3 = 50 + outerRadius * Math.sin(endAngle)
      const x4 = 50 + innerRadius * Math.cos(endAngle)
      const y4 = 50 + innerRadius * Math.sin(endAngle)
      
      const largeArcFlag = sectorAngle > Math.PI ? 1 : 0
      
      let d: string
      if (r === 0) {
        d = `M 50 50 L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} Z`
      } else {
        d = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`
      }
      
      // Pass the vertical column to get color
      cells.push({ d, color: getCellColorFn(bed[r][s], hasGrounds), ring: r, sector: s })
    }
  }
  
  return cells
}

// Calculate total water in the bed (for display purposes)
export function calculateWaterInBed(bed: CoffeeBed): number {
  let totalWater = 0
  
  for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SECTORS; s++) {
      for (let h = 0; h < CELL_HEIGHT; h++) {
        // Free water + water absorbed in wet grounds
        totalWater += bed[r][s][h].freeWater
        totalWater += bed[r][s][h].wetGrounds * (2 / 3) // ~2/3 of wet grounds mass is water
      }
    }
  }
  
  return totalWater
}

// Calculate total grounds in bed
export function calculateGroundsInBed(bed: CoffeeBed): number {
  let totalGrounds = 0
  
  for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SECTORS; s++) {
      for (let h = 0; h < CELL_HEIGHT; h++) {
        // Dry grounds + grounds portion of wet grounds
        totalGrounds += bed[r][s][h].dryGrounds
        totalGrounds += bed[r][s][h].wetGrounds * (1 / 3) // ~1/3 of wet grounds mass is grounds
      }
    }
  }
  
  return totalGrounds
}

// Find the maximum height that has content
export function calculateGroundsHeight(bed: CoffeeBed): number {
  let maxHeight = 0
  
  for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SECTORS; s++) {
      for (let h = CELL_HEIGHT - 1; h >= 0; h--) {
        const cell = bed[r][s][h]
        const hasContent = cell.dryGrounds > 0.01 || cell.wetGrounds > 0.01 || cell.freeWater > 0.1
        
        if (hasContent) {
          maxHeight = Math.max(maxHeight, h + 1)
          break
        }
      }
    }
  }
  
  return maxHeight
}

// Get layer statistics for debug panel - only count cells INSIDE the cone
export function getLayerStats(bed: CoffeeBed, height: number): {
  dryGrounds: number
  wetGrounds: number
  freeWater: number
  cellCount: number
  activeRings: number
} {
  let dryGrounds = 0
  let wetGrounds = 0
  let freeWater = 0
  let cellCount = 0
  
  // Only count cells that are inside the cone at this height
  const activeRings = getActiveRingsAtHeight(height)
  
  for (let r = 0; r < activeRings; r++) {
    for (let s = 0; s < SECTORS; s++) {
      const cell = bed[r][s][height]
      dryGrounds += cell.dryGrounds
      wetGrounds += cell.wetGrounds
      freeWater += cell.freeWater
      cellCount++
    }
  }
  
  return { dryGrounds, wetGrounds, freeWater, cellCount, activeRings }
}
