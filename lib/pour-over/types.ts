// ============================================================================
// POUR-OVER SIMULATOR TYPES - Physics-based fluid model
// ============================================================================

export const RINGS = 4 // Concentric rings from center to edge
export const SECTORS = 8 // Angular divisions
export const CELL_HEIGHT = 10 // Vertical layers in the cone

// ============================================================================
// PHYSICAL CONSTANTS
// ============================================================================

// Densities in g/cm³
export const DENSITY = {
  AIR: 0,
  WATER: 1.0,
  DRY_GROUNDS: 0.4, // Porous, light
  WET_GROUNDS: 1.2, // Absorbed water makes them heavy
} as const

// Cell volume in cm³ (each cell is roughly 0.5cm x 0.5cm x 0.3cm)
export const CELL_VOLUME = 0.075 // cm³

// How much water 1g of dry grounds can absorb (g water per g grounds)
export const ABSORPTION_RATIO = 2.0

// ============================================================================
// CONE GEOMETRY
// ============================================================================

// V60 cone geometry - which rings are active at each height
// Bottom is narrow (small radius), top is wide (large radius)
export function getActiveRingsAtHeight(h: number): number {
  // Linear expansion from bottom to top
  // H0-H1: 1 ring (center only)
  // H2-H3: 2 rings
  // H4-H6: 3 rings  
  // H7-H9: 4 rings (full width)
  if (h <= 1) return 1 // Bottom: narrow
  if (h <= 3) return 2
  if (h <= 6) return 3
  return 4 // Top: full width
}

// Check if a cell is inside the cone at given height
export function isCellInCone(ring: number, height: number): boolean {
  return ring < getActiveRingsAtHeight(height)
}

// ============================================================================
// CELL CONTENTS - Track actual grams of each element
// ============================================================================

export type CellContents = {
  // Mass in grams
  dryGrounds: number   // Grams of dry coffee grounds (density ~0.4)
  wetGrounds: number   // Grams of saturated grounds (grounds + absorbed water, density ~1.2)
  freeWater: number    // Grams of liquid water not absorbed (density 1.0)
  
  // Extracted coffee solids dissolved in the water
  extractedSolids: number
  
  // Temperature of water in this cell
  temperature: number
}

// Helper to calculate how much volume is used in a cell
export function getCellUsedVolume(cell: CellContents): number {
  return (
    (cell.dryGrounds / DENSITY.DRY_GROUNDS) +
    (cell.wetGrounds / DENSITY.WET_GROUNDS) +
    (cell.freeWater / DENSITY.WATER)
  )
}

// Helper to get remaining air space in cm³
export function getCellAirVolume(cell: CellContents): number {
  return Math.max(0, CELL_VOLUME - getCellUsedVolume(cell))
}

// Helper to check if cell is full
export function isCellFull(cell: CellContents): boolean {
  return getCellAirVolume(cell) < 0.001
}

// Helper to get total grounds (dry + wet) in grams
export function getTotalGrounds(cell: CellContents): number {
  // Wet grounds include absorbed water, so extract just the grounds portion
  // wetGrounds mass = grounds mass + absorbed water mass
  // grounds mass = wetGrounds / (1 + ABSORPTION_RATIO)
  const groundsInWet = cell.wetGrounds / (1 + ABSORPTION_RATIO)
  return cell.dryGrounds + groundsInWet
}

// Helper to get total water (free + absorbed) in grams  
export function getTotalWater(cell: CellContents): number {
  // Absorbed water in wet grounds
  const absorbedWater = cell.wetGrounds * (ABSORPTION_RATIO / (1 + ABSORPTION_RATIO))
  return cell.freeWater + absorbedWater
}

// 3D grid: [ring][sector][height]
export type CoffeeBed = CellContents[][][]

export type PourEvent = {
  x: number
  y: number
  ring: number
  sector: number
  time: number
}

export type PourPattern = {
  evenness: number
  edgeAvoidance: number
  circularity: number
  channeling: number
}

export type BrewResult = {
  tds: number
  extractionYield: number
  quality: "under" | "optimal" | "over"
  score: number
  notes: string[]
}

export type Phase = "grind" | "pour" | "complete"
