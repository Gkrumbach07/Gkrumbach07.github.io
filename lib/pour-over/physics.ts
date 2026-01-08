// ============================================================================
// COFFEE BED PHYSICS - Gram-based fluid simulation with dry/wet grounds
// ============================================================================

import { 
  CoffeeBed, 
  CellContents, 
  PourEvent, 
  PourPattern, 
  BrewResult, 
  RINGS, 
  SECTORS, 
  CELL_HEIGHT,
  CELL_VOLUME,
  DENSITY,
  ABSORPTION_RATIO,
  isCellInCone, 
  getActiveRingsAtHeight,
  getCellAirVolume,
  isCellFull,
  getTotalGrounds,
  getTotalWater
} from "./types"

// ============================================================================
// CREATE EMPTY BED
// ============================================================================

export function createEmptyBed(): CoffeeBed {
  // Create 3D grid: rings × sectors × height layers
  // All cells start as empty (air)
  return Array.from({ length: RINGS }, () =>
    Array.from({ length: SECTORS }, () =>
      Array.from({ length: CELL_HEIGHT }, () => ({
        dryGrounds: 0,
        wetGrounds: 0,
        freeWater: 0,
        extractedSolids: 0,
        temperature: 20,
      }))
    )
  )
}

// ============================================================================
// ADD DRY GROUNDS TO BED
// ============================================================================

export function addGroundsToBed(bed: CoffeeBed, groundsWeight: number): CoffeeBed {
  const newBed = bed.map(r => r.map(s => s.map(c => ({ ...c }))))
  
  // Calculate how many grams can fit in each cell - tune for visible bed depth
  // With 15-20g coffee, we want it to fill ~3-4 layers for good visualization
  // H0: 8 cells, H1: 8 cells, H2: 16 cells, H3: 16 cells = 48 cells
  // 15g / 48 cells ≈ 0.31g per cell - but we want ~3 layers
  // So cap at ~0.6g per cell to get grounds spread across 3 layers with 8+8+16=32 cells
  const scaledMaxPerCell = 0.8 // ~0.8g per cell - gives 3 layers for 15-20g coffee
  
  // Fill from bottom up, distributing evenly at each height
  let remainingGrounds = groundsWeight
  
  for (let h = 0; h < CELL_HEIGHT && remainingGrounds > 0.01; h++) {
    const activeRings = getActiveRingsAtHeight(h)
    const cellsAtHeight = activeRings * SECTORS
    
    // Distribute remaining grounds evenly across cells at this height
    const groundsPerCell = Math.min(scaledMaxPerCell, remainingGrounds / cellsAtHeight)
    
    for (let r = 0; r < activeRings; r++) {
    for (let s = 0; s < SECTORS; s++) {
        const cell = newBed[r][s][h]
        cell.dryGrounds = groundsPerCell
        cell.wetGrounds = 0
        cell.freeWater = 0
      }
    }
    
    remainingGrounds -= groundsPerCell * cellsAtHeight
  }
  
  return newBed
}

// ============================================================================
// POUR WATER INTO A CELL
// ============================================================================

export function pourWaterIntoCell(
  bed: CoffeeBed,
  ring: number,
  sector: number,
  waterAmount: number,
  temperature: number
): CoffeeBed {
  const newBed = bed.map(r => r.map(s => s.map(c => ({ ...c }))))
  
  // Find the topmost cell in this column that has content or is inside the cone
  let targetHeight = CELL_HEIGHT - 1
  
  // Start from top and find where water should land
  for (let h = CELL_HEIGHT - 1; h >= 0; h--) {
    if (!isCellInCone(ring, h)) continue
    
    const cell = newBed[ring][sector][h]
    const hasContent = cell.dryGrounds > 0.01 || cell.wetGrounds > 0.01 || cell.freeWater > 0.01
    
    if (hasContent) {
      // Water lands on top of content (one cell above, or at content if at top)
      targetHeight = Math.min(CELL_HEIGHT - 1, h + 1)
      if (!isCellInCone(ring, targetHeight)) {
        targetHeight = h // Land at content level if above is outside cone
      }
      break
    }
  }
  
  // If no content found, water goes to bottom
  if (targetHeight === CELL_HEIGHT - 1) {
    for (let h = 0; h < CELL_HEIGHT; h++) {
      if (isCellInCone(ring, h)) {
        targetHeight = h
        break
      }
    }
  }
  
  // Add water to target cell
  const cell = newBed[ring][sector][targetHeight]
  cell.freeWater += waterAmount
  cell.temperature = temperature
  
  return newBed
}

// ============================================================================
// GET ADJACENT CELLS
// ============================================================================

function getAdjacentCells(r: number, s: number, h: number): Array<{ r: number; s: number; h: number }> {
  const adjacent: Array<{ r: number; s: number; h: number }> = []
  
  // Same ring, adjacent sectors (wrapping)
  adjacent.push({ r, s: (s - 1 + SECTORS) % SECTORS, h })
  adjacent.push({ r, s: (s + 1) % SECTORS, h })
  
  // Adjacent rings (if they exist and are in cone)
  if (r > 0 && isCellInCone(r - 1, h)) {
    adjacent.push({ r: r - 1, s, h })
  }
  if (r < RINGS - 1 && isCellInCone(r + 1, h)) {
    adjacent.push({ r: r + 1, s, h })
  }
  
  return adjacent
}

// ============================================================================
// MAIN PHYSICS SIMULATION STEP
// ============================================================================

export function simulatePhysicsStep(
  bed: CoffeeBed,
  grindSize: number,
  deltaTime: number = 0.1
): { newBed: CoffeeBed; drained: number } {
  const newBed = bed.map(r => r.map(s => s.map(c => ({ ...c }))))
  let totalDrained = 0
  
  // Physics rates (tuned for simulation)
  const grindModifier = 0.3 + (grindSize / 100) * 0.7
  const drainRate = 0.12 * grindModifier // Water exiting bottom
  const percolationRate = 0.7   // Water through grounds (increased)
  const freeFallRate = 0.95     // Water through air (fast!)
  const lateralRate = 0.5       // Horizontal spreading
  const settleRate = 0.08       // Wet grounds sinking (SLOWER - prevents all settling to H0)
  const floatRate = 0.05        // Dry grounds floating (slower)
  
  // Cell capacity - each cell can hold ~3g total material
  const maxCellCapacity = 3.0 // grams
  
  // ============================================================
  // STEP 1: ABSORPTION - Dry grounds absorb water → become wet
  // ============================================================
  for (let h = 0; h < CELL_HEIGHT; h++) {
    const activeRings = getActiveRingsAtHeight(h)
    for (let r = 0; r < activeRings; r++) {
      for (let s = 0; s < SECTORS; s++) {
        const cell = newBed[r][s][h]
        
        // Simple absorption: if dry grounds and water are in same cell, absorb!
        if (cell.dryGrounds > 0.005 && cell.freeWater > 0.01) {
          // Convert dry grounds to wet grounds
          // Each gram of dry grounds absorbs ABSORPTION_RATIO grams of water
          // wetGrounds = original grounds + absorbed water = grounds * (1 + ABSORPTION_RATIO)
          
          // How much dry grounds can get wet this tick (aggressive absorption!)
          const groundsToWet = Math.min(
            cell.dryGrounds * 0.8, // Up to 80% of dry grounds per tick
            cell.freeWater / ABSORPTION_RATIO // Limited by available water
          )
          
          if (groundsToWet > 0.001) {
            const waterAbsorbed = groundsToWet * ABSORPTION_RATIO
            
            cell.dryGrounds -= groundsToWet
            cell.freeWater -= waterAbsorbed
            cell.wetGrounds += groundsToWet + waterAbsorbed // wetGrounds includes both
          }
        }
      }
    }
  }
  
  // ============================================================
  // STEP 2: DRAINAGE - Water exits from bottom (H=0)
  // ============================================================
  const activeRingsH0 = getActiveRingsAtHeight(0)
  for (let r = 0; r < activeRingsH0; r++) {
    for (let s = 0; s < SECTORS; s++) {
      const cell = newBed[r][s][0]
      
      if (cell.freeWater > 0.01) {
        // Drain rate affected by how much grounds are blocking
        const totalGrounds = cell.dryGrounds + cell.wetGrounds
        const groundsBlock = totalGrounds / maxCellCapacity
        const effectiveDrain = drainRate * (1 - groundsBlock * 0.3)
        
        const drainAmount = cell.freeWater * effectiveDrain
        cell.freeWater -= drainAmount
        totalDrained += drainAmount
        
        // Extract coffee while draining
        const cellGrounds = getTotalGrounds(cell)
        if (cellGrounds > 0.1 && cell.temperature > 20) {
          const extractionRate = 0.02 * (cell.temperature / 92) * (drainAmount / 10)
          const extracted = Math.min(extractionRate, cellGrounds * 0.25)
          cell.extractedSolids += extracted
        }
      }
    }
  }
  
  // ============================================================
  // STEP 3: GRAVITY - Wet grounds sink (TOP to BOTTOM)
  // ============================================================
  for (let h = CELL_HEIGHT - 1; h > 0; h--) {
    const activeRingsAbove = getActiveRingsAtHeight(h)
    const activeRingsBelow = getActiveRingsAtHeight(h - 1)
    const maxRings = Math.min(activeRingsAbove, activeRingsBelow)
    
    for (let r = 0; r < maxRings; r++) {
      for (let s = 0; s < SECTORS; s++) {
        const cellAbove = newBed[r][s][h]
        const cellBelow = newBed[r][s][h - 1]
        
        // Wet grounds are heavy (density 1.2) - they sink through water
        if (cellAbove.wetGrounds > 0.01) {
          // Can sink if there's space below (water or air)
          const belowTotalMass = cellBelow.dryGrounds + cellBelow.wetGrounds + cellBelow.freeWater
          const spaceBelow = Math.max(0, maxCellCapacity - belowTotalMass)
          
          if (spaceBelow > 0.01) {
            const sinkAmount = Math.min(
              cellAbove.wetGrounds * settleRate,
              spaceBelow * 0.3 // Limit how much can sink per tick
            )
            
            if (sinkAmount > 0.01) {
              cellAbove.wetGrounds -= sinkAmount
              cellBelow.wetGrounds += sinkAmount
              
              // Displace some water upward (wet grounds push water up)
              const waterDisplaced = Math.min(sinkAmount / DENSITY.WET_GROUNDS, cellBelow.freeWater)
              if (waterDisplaced > 0.01) {
                cellBelow.freeWater -= waterDisplaced
                cellAbove.freeWater += waterDisplaced
              }
            }
          }
        }
      }
    }
  }
  
  // ============================================================
  // STEP 4: WATER FALLS (TOP to BOTTOM)
  // ============================================================
  for (let h = CELL_HEIGHT - 1; h > 0; h--) {
    const activeRingsAbove = getActiveRingsAtHeight(h)
    const activeRingsBelow = getActiveRingsAtHeight(h - 1)
    const maxRings = Math.min(activeRingsAbove, activeRingsBelow)
    
    for (let r = 0; r < maxRings; r++) {
      for (let s = 0; s < SECTORS; s++) {
        const cellAbove = newBed[r][s][h]
        const cellBelow = newBed[r][s][h - 1]
        
        if (cellAbove.freeWater > 0.01) {
          // Calculate available space below (simple mass-based)
          const belowTotalMass = cellBelow.dryGrounds + cellBelow.wetGrounds + cellBelow.freeWater
          const spaceBelow = Math.max(0, maxCellCapacity - belowTotalMass)
          
          // Flow rate depends on what's below
          let flowRate = freeFallRate // Fast through air
          const groundsBelow = cellBelow.dryGrounds + cellBelow.wetGrounds
          if (groundsBelow > 0.3) {
            // Percolation through grounds - slower but still happens
            const porosity = Math.max(0.3, 1 - groundsBelow / maxCellCapacity)
            flowRate = percolationRate * porosity
          }
          
          const flowAmount = Math.min(
            cellAbove.freeWater * flowRate,
            spaceBelow
          )
          
          if (flowAmount > 0.01) {
            cellAbove.freeWater -= flowAmount
            cellBelow.freeWater += flowAmount
            cellBelow.temperature = Math.max(cellBelow.temperature, cellAbove.temperature * 0.98)
          }
        }
      }
    }
  }
  
  // ============================================================
  // STEP 5: LATERAL SPREADING (pressure equalization)
  // ============================================================
  for (let pass = 0; pass < 2; pass++) {
    for (let h = 0; h < CELL_HEIGHT; h++) {
      const activeRings = getActiveRingsAtHeight(h)
      
      for (let r = 0; r < activeRings; r++) {
        for (let s = 0; s < SECTORS; s++) {
          const cell = newBed[r][s][h]
          
          if (cell.freeWater > 0.1) {
            const adjacent = getAdjacentCells(r, s, h)
            
            for (const adj of adjacent) {
              if (!isCellInCone(adj.r, adj.h)) continue
              
              const adjCell = newBed[adj.r][adj.s][adj.h]
              const pressureDiff = cell.freeWater - adjCell.freeWater
              
              if (pressureDiff > 0.05) {
                // Calculate space in adjacent cell (simple mass-based)
                const adjTotalMass = adjCell.dryGrounds + adjCell.wetGrounds + adjCell.freeWater
                const spaceAdj = Math.max(0, maxCellCapacity - adjTotalMass)
                
                const flowAmount = Math.min(
                  pressureDiff * lateralRate,
                  spaceAdj * 0.5,
                  cell.freeWater * 0.3
                )
                
                if (flowAmount > 0.01) {
                  cell.freeWater -= flowAmount
                  adjCell.freeWater += flowAmount
                  adjCell.temperature = (adjCell.temperature + cell.temperature) / 2
                }
              }
            }
          }
        }
      }
    }
  }
  
  // ============================================================
  // STEP 6: BUOYANCY - Dry grounds float up through water
  // ============================================================
  for (let h = 0; h < CELL_HEIGHT - 1; h++) {
    const activeRingsBelow = getActiveRingsAtHeight(h)
    const activeRingsAbove = getActiveRingsAtHeight(h + 1)
    const maxRings = Math.min(activeRingsBelow, activeRingsAbove)
    
    for (let r = 0; r < maxRings; r++) {
      for (let s = 0; s < SECTORS; s++) {
        const cellBelow = newBed[r][s][h]
        const cellAbove = newBed[r][s][h + 1]
        
        // Dry grounds (density 0.4) float up through water (density 1.0)
        if (cellBelow.dryGrounds > 0.01 && cellBelow.freeWater > 0.1) {
          // Calculate available space above (simple mass-based)
          const aboveTotalMass = cellAbove.dryGrounds + cellAbove.wetGrounds + cellAbove.freeWater
          const spaceAbove = Math.max(0, maxCellCapacity - aboveTotalMass)
          
          const floatAmount = Math.min(
            cellBelow.dryGrounds * floatRate,
            spaceAbove * 0.3
          )
          
          if (floatAmount > 0.01) {
            cellBelow.dryGrounds -= floatAmount
            cellAbove.dryGrounds += floatAmount
            
            // Water displaced downward
            const waterDisplaced = Math.min(floatAmount, cellAbove.freeWater * 0.5)
            if (waterDisplaced > 0.01) {
              cellAbove.freeWater -= waterDisplaced
              cellBelow.freeWater += waterDisplaced
            }
          }
        }
      }
    }
  }
  
  // ============================================================
  // STEP 7: CLEANUP - ensure non-negative values
  // ============================================================
  for (let h = 0; h < CELL_HEIGHT; h++) {
    const activeRings = getActiveRingsAtHeight(h)
    for (let r = 0; r < activeRings; r++) {
      for (let s = 0; s < SECTORS; s++) {
        const cell = newBed[r][s][h]
        
        // Clamp to non-negative
        cell.dryGrounds = Math.max(0, cell.dryGrounds)
        cell.wetGrounds = Math.max(0, cell.wetGrounds)
        cell.freeWater = Math.max(0, cell.freeWater)
        
        // Remove trace amounts
        if (cell.dryGrounds < 0.001) cell.dryGrounds = 0
        if (cell.wetGrounds < 0.001) cell.wetGrounds = 0
        if (cell.freeWater < 0.001) cell.freeWater = 0
      }
    }
  }
  
  return { newBed, drained: totalDrained }
}

// ============================================================================
// ANALYZE POUR PATTERN
// ============================================================================

export function analyzePourPattern(pours: PourEvent[]): PourPattern {
  if (pours.length < 3) {
    return { evenness: 0.5, edgeAvoidance: 1, circularity: 0, channeling: 1 }
  }

  const sectorCounts = new Array(SECTORS).fill(0)
  const ringCounts = new Array(RINGS).fill(0)
  
  for (const pour of pours) {
    sectorCounts[pour.sector]++
    ringCounts[pour.ring]++
  }

  const maxSector = Math.max(...sectorCounts)
  const minSector = Math.min(...sectorCounts.filter(c => c > 0))
  const evenness = minSector > 0 ? Math.min(1, minSector / (maxSector * 0.5)) : 0.3

  const outerRingPours = ringCounts[RINGS - 1] + ringCounts[RINGS - 2]
  const edgeAvoidance = 1 - (outerRingPours / pours.length) * 0.8

  let circularScore = 0
  for (let i = 1; i < pours.length; i++) {
    const prev = pours[i - 1]
    const curr = pours[i]
    const sectorDiff = Math.abs(curr.sector - prev.sector)
    if (sectorDiff === 1 || sectorDiff === SECTORS - 1) {
      circularScore += 1
    }
  }
  const circularity = pours.length > 1 ? circularScore / (pours.length - 1) : 0

  const maxConcentration = Math.max(...sectorCounts)
  const channeling = 1 - Math.min(1, (maxConcentration / pours.length - 1 / SECTORS) * 3)

  return { evenness, edgeAvoidance, circularity, channeling: Math.max(0, channeling) }
}

// ============================================================================
// CALCULATE EXTRACTION
// ============================================================================

export function calculateExtraction(
  temp: number,
  grindSize: number,
  groundsWeight: number,
  waterWeight: number,
  contactTime: number,
  bed: CoffeeBed,
  pourPattern: PourPattern,
  roast: "light" | "medium" | "dark" = "medium"
): BrewResult {
  if (groundsWeight === 0 || waterWeight === 0) {
    return { tds: 0, extractionYield: 0, quality: "under", score: 0, notes: ["No brew data"] }
  }

  const ratio = waterWeight / groundsWeight
  const notes: string[] = []

  // Calculate total extracted solids from bed
  let totalExtracted = 0
  for (let r = 0; r < RINGS; r++) {
    for (let s = 0; s < SECTORS; s++) {
      for (let h = 0; h < CELL_HEIGHT; h++) {
        totalExtracted += bed[r][s][h].extractedSolids
      }
    }
  }

  // TDS = extracted solids / water weight
  const tds = Math.max(0.8, Math.min(2.0, (totalExtracted / waterWeight) * 100))

  // Extraction yield = extracted / original grounds weight
  const extractionYield = Math.min(28, Math.max(10, (totalExtracted / groundsWeight) * 100))

  let tempFactor = 1
  if (temp < 85) {
    tempFactor = 0.8
    notes.push("Water too cold")
  } else if (temp > 96) {
    tempFactor = 0.9
    notes.push("Water too hot")
  }

  let grindFactor = 1
  if (grindSize < 20) {
    notes.push("Grind too fine - bed stalling")
  } else if (grindSize > 80) {
    notes.push("Grind too coarse")
  }

  if (contactTime < 120) {
    notes.push("Brew too fast")
  } else if (contactTime > 300) {
    notes.push("Brew too slow")
  }

  if (pourPattern.edgeAvoidance < 0.5) notes.push("Too much edge pouring")
  if (pourPattern.channeling < 0.4) notes.push("Channeling detected")
  if (pourPattern.circularity > 0.6) notes.push("Good circular pour")

  let quality: "under" | "optimal" | "over"
  if (extractionYield < 18) quality = "under"
  else if (extractionYield > 22) quality = "over"
  else quality = "optimal"

  const extractionScore = 100 - Math.abs(extractionYield - 20) * 10
  const tdsScore = 100 - Math.abs(tds - 1.25) * 80
  const patternScore = (pourPattern.evenness + pourPattern.edgeAvoidance + pourPattern.circularity + pourPattern.channeling) / 4 * 100
  const score = Math.round(Math.max(0, Math.min(100, extractionScore * 0.4 + tdsScore * 0.3 + patternScore * 0.3)))

  return { 
    tds: Math.round(tds * 100) / 100, 
    extractionYield: Math.round(extractionYield * 10) / 10, 
    quality, 
    score, 
    notes: notes.slice(0, 4) 
  }
}
