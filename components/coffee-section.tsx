"use client"

import { Coffee, Thermometer, Clock, MapPin, Droplets, Move, Circle, Flame, Leaf, FlaskConical, ChevronDown, History } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PourOverSimulator } from "./pour-over-simulator"

type BlendComponent = {
  name: string
  percentage: number
  origin: string
  process: string
  variety: string
  url: string
}

type CoffeeData = {
  name: string
  url: string
  roaster: string
  origin: string | "Mixed"
  process: string | "Mixed"
  roast: string | "Mixed"
  variety: string | "Mixed"
  blendComponents?: BlendComponent[]
  notes: string[]
  brewMethod: string
  ratio: string
  temp: string
  grindSize: string
  bloomTime: string
  pours: string
  agitation: string
}

const currentCoffee: CoffeeData = {
  name: "Rodrigo Sanchez - Passion Fruit",
  url: "https://www.blackwhiteroasters.com/products/r-rodrigo-sanchez-passion-fruit",
  roaster: "Black & White Coffee Roasters",
  origin: "La Tacora, San Adolfo, Huila, Colombia",
  process: "Co-ferment",
  roast: "Light",
  variety: "Purple Caturra",
  notes: ["Passion Fruit Candy", "Mango Lassi", "Strawberry Jam", "Milk Tea"],
  brewMethod: "V60 Pour-Over",
  ratio: "1:16",
  temp: "90°C",
  grindSize: "Medium",
  bloomTime: "2 min",
  pours: "1-2",
  agitation: "Low",
}

const coffeeHistory: CoffeeData[] = [
  {
    name: "Holiday Blend",
    url: "https://www.blackwhiteroasters.com/collections/the-coffee-archive/products/r-holiday-blend-tis-the-season-2025",
    roaster: "Black & White Coffee Roasters",
    origin: "Mixed",
    process: "Mixed",
    roast: "Light-Medium",
    variety: "Mixed",
    blendComponents: [
      {
        name: "Ushirika",
        percentage: 50,
        origin: "Nyeri, Kenya",
        process: "Washed",
        variety: "SL28, SL34, Batian, Ruiru 11",
        url: "https://www.blackwhiteroasters.com/collections/the-coffee-archive/products/r-ushirika-washed",
      },
      {
        name: "Huver Castillo",
        percentage: 25,
        origin: "Buesaco, Nariño, Colombia",
        process: "Anaerobic Honey",
        variety: "Gesha",
        url: "https://www.blackwhiteroasters.com/products/r-huver-castillo-anaerobic-honey-gesha",
      },
      {
        name: "Esteban Zamora",
        percentage: 25,
        origin: "San Marcos, Tarrazú, Costa Rica",
        process: "Cinnamon Anaerobic",
        variety: "Caturra, Catuai",
        url: "https://www.blackwhiteroasters.com/products/r-esteban-zamora-cinnamon-anaerobic",
      },
    ],
    notes: ["Cinnamon Sugar", "Cherry Cobbler", "Chocolate"],
    brewMethod: "V60 Pour-Over",
    ratio: "1:16",
    temp: "90°C",
    grindSize: "Medium",
    bloomTime: "2 min",
    pours: "1-2",
    agitation: "Low",
  },
]

type MixedPopoverProps = {
  label: string
  icon: React.ReactNode
  blendComponents: BlendComponent[]
  field: "origin" | "process" | "variety"
}

function MixedPopover({ label, icon, blendComponents, field }: MixedPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors group cursor-pointer">
          <div className="p-1.5 bg-muted rounded-md">
            {icon}
          </div>
          <div className="text-left">
            <p className="text-xs font-mono text-muted-foreground">{label}</p>
            <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1">
              Mixed
              <ChevronDown className="w-3 h-3" />
            </p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{label} Breakdown</p>
          <div className="space-y-2">
            {blendComponents.map((component) => (
              <Link
                key={component.name}
                href={component.url}
                target="_blank"
                className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                    {component.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {component[field]}
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-600 dark:text-amber-400 ml-2 flex-shrink-0">
                  {component.percentage}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type CoffeeDetailProps = {
  label: string
  value: string
  icon: React.ReactNode
}

function CoffeeDetail({ label, value, icon }: CoffeeDetailProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="p-1.5 bg-muted rounded-md">
        {icon}
      </div>
      <div>
        <p className="text-xs font-mono text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export function CoffeeSection() {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6">
        <Coffee className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Currently Brewing</h2>
      </div>

      <p className="text-muted-foreground mb-8 max-w-2xl">
        What's in my cup right now? Because good code deserves good coffee.
      </p>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left side - Coffee card */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 relative">
          {/* History button */}
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-md transition-colors group"
                aria-label="View coffee history"
              >
                <History className="w-4 h-4 text-muted-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Coffee History</p>
                <div className="space-y-2">
                  {coffeeHistory.map((coffee) => (
                    <Link
                      key={coffee.name}
                      href={coffee.url}
                      target="_blank"
                      className="block p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 truncate">
                            {coffee.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {coffee.roaster}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {coffee.notes.slice(0, 2).map((note) => (
                              <span
                                key={note}
                                className="px-2 py-0.5 text-xs font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded"
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Left column - Coffee details */}
            <div className="space-y-6">
              {/* Coffee name and roaster */}
              <div>
                <Link 
                  href={currentCoffee.url} 
                  target="_blank"
                  className="text-xl md:text-2xl font-semibold hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  {currentCoffee.name}
                </Link>
                <p className="text-muted-foreground mt-1">{currentCoffee.roaster}</p>
              </div>

              {/* Coffee details grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Origin */}
                {currentCoffee.origin === "Mixed" && currentCoffee.blendComponents ? (
                  <MixedPopover
                    label="Origin"
                    icon={<MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
                    blendComponents={currentCoffee.blendComponents}
                    field="origin"
                  />
                ) : (
                  <CoffeeDetail
                    label="Origin"
                    value={currentCoffee.origin}
                    icon={<MapPin className="w-3.5 h-3.5 text-muted-foreground" />}
                  />
                )}

                {/* Process */}
                {currentCoffee.process === "Mixed" && currentCoffee.blendComponents ? (
                  <MixedPopover
                    label="Process"
                    icon={<FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />}
                    blendComponents={currentCoffee.blendComponents}
                    field="process"
                  />
                ) : (
                  <CoffeeDetail
                    label="Process"
                    value={currentCoffee.process}
                    icon={<FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />}
                  />
                )}

                {/* Roast */}
                {currentCoffee.roast === "Mixed" && currentCoffee.blendComponents ? (
                  <MixedPopover
                    label="Roast"
                    icon={<Flame className="w-3.5 h-3.5 text-muted-foreground" />}
                    blendComponents={currentCoffee.blendComponents}
                    field="process"
                  />
                ) : (
                  <CoffeeDetail
                    label="Roast"
                    value={currentCoffee.roast}
                    icon={<Flame className="w-3.5 h-3.5 text-muted-foreground" />}
                  />
                )}

                {/* Variety */}
                {currentCoffee.variety === "Mixed" && currentCoffee.blendComponents ? (
                  <MixedPopover
                    label="Variety"
                    icon={<Leaf className="w-3.5 h-3.5 text-muted-foreground" />}
                    blendComponents={currentCoffee.blendComponents}
                    field="variety"
                  />
                ) : (
                  <CoffeeDetail
                    label="Variety"
                    value={currentCoffee.variety}
                    icon={<Leaf className="w-3.5 h-3.5 text-muted-foreground" />}
                  />
                )}
              </div>

              {/* Tasting notes */}
              <div>
                <p className="text-sm font-mono text-muted-foreground mb-2">Tasting Notes</p>
                <div className="flex flex-wrap gap-2">
                  {currentCoffee.notes.map((note) => (
                    <span
                      key={note}
                      className="px-3 py-1.5 text-sm font-mono bg-amber-500/10 text-amber-700 dark:text-amber-300 rounded-md"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Brew details */}
            <div className="flex items-center">
              <div className="w-full space-y-6">
                <p className="text-sm font-mono text-muted-foreground mb-4">Brew Parameters</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Coffee className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Method</p>
                      <p className="text-sm font-medium">{currentCoffee.brewMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Ratio</p>
                      <p className="text-sm font-medium">{currentCoffee.ratio}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Grind</p>
                      <p className="text-sm font-medium">{currentCoffee.grindSize}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Thermometer className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Temperature</p>
                      <p className="text-sm font-medium">{currentCoffee.temp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Bloom Time</p>
                      <p className="text-sm font-medium">{currentCoffee.bloomTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Coffee className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Pours</p>
                      <p className="text-sm font-medium">{currentCoffee.pours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 col-span-2">
                    <div className="p-2 bg-muted rounded-md flex-shrink-0">
                      <Move className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">Agitation</p>
                      <p className="text-sm font-medium">{currentCoffee.agitation}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Pour Over Simulator (dev only while being refined) */}
        {process.env.NODE_ENV === 'development' && <PourOverSimulator />}
      </div>
    </div>
  )
}
