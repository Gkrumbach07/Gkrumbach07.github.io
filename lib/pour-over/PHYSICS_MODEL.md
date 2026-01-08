# Pour-Over Coffee Simulator: Cell Physics Model

## Overview

The simulation models a V60 cone as a 3D grid of cells. Each cell tracks its contents in **grams** and simulates realistic fluid/particle dynamics.

---

## Cell Elements

| Element | Symbol | Density (g/cm³) | Notes |
|---------|--------|-----------------|-------|
| **Air** | `A` | ~0 | Empty space, can be displaced by anything |
| **Water** | `W` | 1.0 | Flows downward, spreads laterally |
| **Dry Grounds** | `Gd` | 0.35-0.45 | Porous, lighter than water, absorbs water |
| **Wet Grounds** | `Gw` | 1.1-1.3 | Denser than water, sinks through water |

### Density Hierarchy (heaviest first)
```
Wet Grounds (1.2) > Water (1.0) > Dry Grounds (0.4) > Air (0)
```

This means:
- Wet grounds **sink** through water
- Dry grounds **float** on water (until they absorb and become wet)
- Water displaces air
- Everything displaces air

---

## Cell Structure

```typescript
type CellContents = {
  dryGrounds: number   // grams of dry coffee grounds
  wetGrounds: number   // grams of saturated grounds (absorbed water)
  freeWater: number    // grams of liquid water (not absorbed)
  // Air is implicit: air = maxVolume - (dryGrounds/densityDry + wetGrounds/densityWet + freeWater/densityWater)
}

type Cell = {
  contents: CellContents
  maxVolume: number    // cm³ - based on cone geometry
  temperature: number  // °C
}
```

### Volume Calculation
```
usedVolume = (dryGrounds / 0.4) + (wetGrounds / 1.2) + (freeWater / 1.0)
airVolume = maxVolume - usedVolume
isFull = airVolume <= 0
```

---

## Cell Neighbors

Each cell can have up to 6 neighbors:

```
        [TOP]           - cell above (or open air if topmost layer)
          |
  [LEFT]--*--[RIGHT]    - adjacent cells in same ring (wraps around)
          |
       [BOTTOM]         - cell below (or DRAIN if bottom layer)
       
  [INNER] / [OUTER]     - cells in adjacent rings (toward center / toward edge)
```

### Neighbor Types
| Position | If Exists | If Missing |
|----------|-----------|------------|
| TOP | Another cell | Open air (infinite capacity) |
| BOTTOM | Another cell | **DRAIN** (exits to mug) |
| LEFT/RIGHT | Adjacent sector | Wraps to sector 0/11 |
| INNER | Smaller ring | Wall (no flow) |
| OUTER | Larger ring | Wall (no flow) at cone edge |

---

## Physics Rules

### Rule 1: Water Absorption (Dry → Wet Grounds)

When water contacts dry grounds, absorption occurs:

```
absorptionRate = 2.0  // grams water per gram dry grounds at full saturation

// Per tick:
if (dryGrounds > 0 && freeWater > 0) {
  maxAbsorption = dryGrounds * absorptionRate
  currentlyAbsorbed = wetGrounds - (wetGrounds / (1 + absorptionRate)) * absorptionRate
  canAbsorb = maxAbsorption - currentlyAbsorbed
  
  waterToAbsorb = min(freeWater * 0.3, canAbsorb)  // 30% of water absorbed per tick
  
  // Convert dry grounds to wet grounds
  groundsToWet = waterToAbsorb / absorptionRate
  dryGrounds -= groundsToWet
  wetGrounds += groundsToWet + waterToAbsorb  // wet grounds = grounds + absorbed water
  freeWater -= waterToAbsorb
}
```

**Result:** Dry grounds + water → Wet grounds (heavier, takes less volume)

---

### Rule 2: Gravity - Vertical Flow

Water and wet grounds fall downward. Process bottom-to-top to avoid double-moving.

```
for each cell (bottom to top):
  neighbor = cell.bottom
  
  if neighbor == DRAIN:
    // Water exits to mug
    drainAmount = freeWater * drainRate * (1 - wetGrounds/maxGroundsCapacity)
    freeWater -= drainAmount
    drainedCoffee += drainAmount
    
  else if neighbor exists:
    availableSpace = neighbor.airVolume
    
    // 2a. Wet grounds sink (densest)
    if wetGrounds > 0 && availableSpace > 0:
      sinkAmount = min(wetGrounds * 0.4, availableSpace * 1.2)
      cell.wetGrounds -= sinkAmount
      neighbor.wetGrounds += sinkAmount
    
    // 2b. Free water falls
    if freeWater > 0 && neighbor.airVolume > 0:
      // Flow rate depends on what's below
      if neighbor.hasGrounds:
        flowRate = percolationRate * (neighbor.airVolume / neighbor.maxVolume)
      else:
        flowRate = freeFallRate  // Fast through empty space
      
      waterToMove = min(freeWater * flowRate, neighbor.airVolume)
      cell.freeWater -= waterToMove
      neighbor.freeWater += waterToMove
```

---

### Rule 3: Lateral Spreading (Pressure Equalization)

Water spreads horizontally to equalize pressure. Higher water columns push water sideways.

```
for each cell:
  for each lateral neighbor (left, right, inner, outer):
    if neighbor exists:
      // Calculate pressure difference (based on water height above)
      myPressure = freeWater + waterInCellsAbove
      neighborPressure = neighbor.freeWater + waterInNeighborCellsAbove
      
      pressureDiff = myPressure - neighborPressure
      
      if pressureDiff > threshold:
        // Water flows from high pressure to low pressure
        flowAmount = pressureDiff * lateralFlowRate
        
        if neighbor.airVolume > flowAmount:
          cell.freeWater -= flowAmount
          neighbor.freeWater += flowAmount
```

---

### Rule 4: Buoyancy - Dry Grounds Float

Dry grounds are less dense than water, so they float upward.

```
for each cell (top to bottom):  // Process top-down for floating
  if dryGrounds > 0 && freeWater > 0:
    neighbor = cell.top
    
    if neighbor exists && neighbor.airVolume > 0:
      // Dry grounds float up through water
      floatAmount = min(dryGrounds * 0.2, neighbor.airVolume * 0.4)
      cell.dryGrounds -= floatAmount
      neighbor.dryGrounds += floatAmount
```

---

### Rule 5: Overflow (Cell at Capacity)

When a cell is full and receives more material, it must push contents elsewhere.

```
if cell.isFull && incomingWater > 0:
  // Priority: push to neighbors with space
  
  // 1. Try pushing down (preferred - gravity assists)
  if bottom.airVolume > 0:
    pushDown(min(incomingWater, bottom.airVolume))
  
  // 2. Try pushing sideways
  for neighbor in [left, right, inner, outer]:
    if neighbor.airVolume > 0:
      pushSideways(remaining / 4)
  
  // 3. Push up (water rises when nowhere else to go)
  if top.airVolume > 0:
    pushUp(remaining)
  
  // 4. If truly nowhere to go, reject the incoming water
  //    (caller must handle this - water backs up)
```

---

### Rule 6: Agitation (Pour Velocity)

When water is actively being poured, it disturbs the grounds bed.

```
if isActivelyPouring && pourVelocity > threshold:
  for each cell receiving water:
    // Turbulence lifts grounds upward
    if wetGrounds > 0:
      liftAmount = wetGrounds * agitationFactor * pourVelocity
      cell.wetGrounds -= liftAmount
      cell.top.wetGrounds += liftAmount  // Grounds suspended in water
    
    // Dry grounds get pushed around
    if dryGrounds > 0:
      scatterAmount = dryGrounds * agitationFactor * 0.5
      // Distribute to lateral neighbors
```

---

## Simulation Loop

Each physics tick processes in this order:

```
1. ABSORPTION    - Dry grounds absorb nearby water → become wet grounds
2. GRAVITY       - Wet grounds sink, water falls (bottom to top)
3. DRAINAGE      - Water at bottom layer exits to mug
4. SPREADING     - Water pressure equalizes laterally
5. BUOYANCY      - Dry grounds float up through water
6. OVERFLOW      - Full cells push contents to neighbors
7. AGITATION     - Active pour disturbs the bed (if pouring)
8. SETTLING      - Wet grounds compact slightly over time
```

---

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `absorptionRate` | 2.0 | g water absorbed per g dry grounds |
| `drainRate` | 0.05 | Fraction of water that exits per tick |
| `percolationRate` | 0.3 | Water flow through grounds (0-1) |
| `freeFallRate` | 0.8 | Water flow through air (0-1) |
| `lateralFlowRate` | 0.2 | Horizontal spreading speed |
| `agitationFactor` | 0.1 | How much pour disturbs bed |
| `grindModifier` | 0.5-1.5 | Fine grind = slower flow |

---

## State Transitions

```
┌─────────────┐
│   AIR       │ ← Empty cell
└─────┬───────┘
      │ water poured
      ▼
┌─────────────┐
│   WATER     │ ← Free water pooling
└─────┬───────┘
      │ contacts dry grounds
      ▼
┌─────────────┐
│ DRY GROUNDS │ ← Starting state of bed
│ + WATER     │
└─────┬───────┘
      │ absorption over time
      ▼
┌─────────────┐
│ WET GROUNDS │ ← Saturated, heavy, sinks
│ + WATER     │
└─────┬───────┘
      │ drains from bottom
      ▼
┌─────────────┐
│   MUG       │ ← Brewed coffee output
└─────────────┘
```

---

## Visual Representation

Each cell's color should reflect its contents:

| Contents | Color |
|----------|-------|
| Air only | Transparent / light grey |
| Water only | Blue (#3B82F6) |
| Dry grounds only | Light tan (#D4A574) |
| Dry grounds + water | Medium brown (#A67C52) |
| Wet grounds | Dark brown (#5D4037) |
| Wet grounds + water | Very dark brown (#3E2723) with blue tint |

---

## Next Steps

1. Refactor `CellContents` type to use `dryGrounds`, `wetGrounds`, `freeWater`
2. Update `addGroundsToBed()` to initialize with dry grounds
3. Rewrite `simulatePhysicsStep()` following the 8-step loop above
4. Update `getCellColor()` for new element types
5. Update debug panel to show dry/wet/water breakdown

