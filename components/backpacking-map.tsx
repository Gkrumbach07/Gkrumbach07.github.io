"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "./theme-provider"
import { MapPin, Footprints, Tent, Ship, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import mapboxgl from "mapbox-gl"

type ActivityType = "hike" | "backpacking" | "canoe"

type TrailLocation = {
  name: string
  location: string
  lat: number
  lng: number
  activity: ActivityType
  image: string // path in /public/trips/
}

const trailLocations: TrailLocation[] = [
  { name: "Isle Royale", location: "Michigan", lat: 47.8479, lng: -89.1819, activity: "backpacking", image: "isle-royal.jpg" },
  { name: "Pictured Rocks", location: "Michigan", lat: 46.5486444, lng: -86.4466472, activity: "backpacking", image: "pictured-rocks.jpg" },
  { name: "Boundary Waters", location: "Minnesota", lat: 47.9710, lng: -92.0739, activity: "canoe", image: "boundary-waters.jpg" },
  { name: "Mondeaux Hardwoods", location: "Wisconsin", lat: 45.2483083, lng: -90.5041667, activity: "backpacking", image: "mondeaux-hardwoods.jpg" },
  { name: "Arapaho & Roosevelt National Forests", location: "Colorado", lat: 39.8157528, lng: -105.6995389, activity: "backpacking", image: "arapaho-roosevelt.JPG" },
  { name: "Guadalupe Mountains National Park", location: "Texas", lat: 31.9265, lng: -104.8676, activity: "backpacking", image: "guadalupe-mountains.jpg" },
  { name: "Big Bend National Park", location: "Texas", lat: 29.2498, lng: -103.2500, activity: "backpacking", image: "big-bend.jpeg" },
  { name: "Ouachita National Forest", location: "Arkansas", lat: 34.3505, lng: -93.9093, activity: "backpacking", image: "ouachita.jpg" },
  { name: "Sequoia National Park", location: "California", lat: 36.6018417, lng: -118.6813861, activity: "hike", image: "sequoia.jpg" },
  { name: "Yosemite National Park", location: "California", lat: 37.7503278, lng: -119.5987056, activity: "hike", image: "yosemite.jpg" },
  { name: "St. Croix River", location: "Minnesota", lat: 45.9202, lng: -92.6634, activity: "canoe", image: "saint-crox.jpg" },
  { name: "Guadalupe River", location: "Texas", lat: 29.883, lng: -98.5234, activity: "canoe", image: "guadalupe-river.jpeg" },
  { name: "West Clear Creek", location: "Arizona", lat: 34.5386, lng: -111.6842, activity: "backpacking", image: "west-clear-creek.jpg" },
]

const activityConfig = {
  hike: { icon: Footprints, label: "Day Hike", color: "text-emerald-500", mapColor: "#10b981" },
  backpacking: { icon: Tent, label: "Backpacking", color: "text-blue-500", mapColor: "#3b82f6" },
  canoe: { icon: Ship, label: "Canoe Camping", color: "text-amber-500", mapColor: "#f59e0b" },
}

// US bounds to restrict panning
const US_BOUNDS: [[number, number], [number, number]] = [
  [-130, 24], // Southwest
  [-65, 50],  // Northeast
]

type BackpackingMapProps = {
  mapboxToken?: string
}

export function BackpackingMap({ mapboxToken }: BackpackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [imageExpanded, setImageExpanded] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [thumbnailLoading, setThumbnailLoading] = useState(true)
  const { isDark } = useTheme()
  const initialStyleRef = useRef(isDark)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return
    
    if (!mapboxToken) {
      return
    }

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: initialStyleRef.current ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/outdoors-v12",
      center: [-98, 39],
      zoom: 3.5,
      interactive: true,
      attributionControl: false,
      maxBounds: US_BOUNDS,
      minZoom: 3,
    })

    map.current.on("load", () => {
      setMapLoaded(true)
      
      // Add markers
      trailLocations.forEach((location, index) => {
        const color = activityConfig[location.activity].mapColor
        
        // Create marker element
        const el = document.createElement("div")
        el.style.width = "20px"
        el.style.height = "20px"
        el.style.backgroundColor = color
        el.style.borderRadius = "50%"
        el.style.border = "3px solid white"
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
        el.style.cursor = "pointer"
        el.title = location.name
        
        el.addEventListener("click", () => {
          setSelectedIndex(index)
          setImageExpanded(false)
          setThumbnailLoading(true)
        })

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([location.lng, location.lat])
          .addTo(map.current!)

        markersRef.current.push(marker)
      })
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.current?.remove()
      map.current = null
    }
  }, [mapboxToken, isDark])

  // Handle theme changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/outdoors-v12")
    }
  }, [isDark, mapLoaded])

  const handleLocationClick = (index: number) => {
    setSelectedIndex(index)
    setThumbnailLoading(true)
    const location = trailLocations[index]
    if (map.current) {
      map.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 7,
        duration: 1500,
      })
    }
  }

  const handleClosePopup = () => {
    setSelectedIndex(null)
    setImageExpanded(false)
    if (map.current) {
      map.current.flyTo({
        center: [-98, 39],
        zoom: 3.5,
        duration: 1000,
      })
    }
  }

  const handleImageClick = () => {
    setImageLoading(true)
    setImageExpanded(true)
  }

  const handleCloseExpanded = () => {
    setImageExpanded(false)
    setImageLoading(false)
  }

  const selectedLocation = selectedIndex !== null ? trailLocations[selectedIndex] : null

  // Location list component
  const LocationList = () => (
    <div className="space-y-1">
      {trailLocations.map((location, index) => {
        const config = activityConfig[location.activity]
        const Icon = config.icon
        return (
          <button
            key={location.name}
            onClick={() => handleLocationClick(index)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
              selectedIndex === index
                ? "bg-primary/10 border border-primary/20"
                : "hover:bg-muted/50"
            )}
          >
            <Icon className={cn("w-4 h-4 flex-shrink-0", config.color)} />
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{location.name}</p>
              <p className="text-xs text-muted-foreground">{location.location}</p>
            </div>
          </button>
        )
      })}
    </div>
  )

  // Show placeholder if no token
  if (!mapboxToken) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* List */}
        <div className="bg-card border border-border rounded-xl p-4 h-[280px] md:h-[400px] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm">{trailLocations.length} places</span>
          </div>
          <LocationList />
        </div>

        {/* Map placeholder */}
        <div className="relative h-[280px] md:h-[400px] rounded-xl overflow-hidden border border-border bg-gradient-to-br from-emerald-900/20 to-blue-900/20">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <MapPin className="w-8 h-8 text-primary mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground text-center">Map requires Mapbox token</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
      {/* List */}
      <div className="bg-card border border-border rounded-xl p-4 h-[400px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm">{trailLocations.length} places</span>
        </div>
        <LocationList />
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-border space-y-2">
          {Object.entries(activityConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <div key={key} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className={cn("w-3 h-3", config.color)} />
                <span>{config.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Map */}
      <div className="relative h-[400px] rounded-xl overflow-hidden border border-border bg-muted">
        <div ref={mapContainer} className="absolute inset-0" style={{ width: "100%", height: "100%" }} />
        
        {/* Expanded image overlay */}
        {selectedLocation && imageExpanded && (
          <div className="absolute inset-0 z-20">
            {/* Loading spinner */}
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/80 backdrop-blur-sm z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            <Image
              src={`/${selectedLocation.image}`}
              alt={selectedLocation.name}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              priority
              onLoad={() => setImageLoading(false)}
            />
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <button
              onClick={handleCloseExpanded}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors z-10"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-center z-10">
              <h4 className="font-semibold text-white drop-shadow-lg">{selectedLocation.name}</h4>
              <p className="text-sm text-white/90 drop-shadow">{selectedLocation.location}</p>
            </div>
          </div>
        )}

        {/* Image popup overlay */}
        {selectedLocation && !imageExpanded && (
          <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-xl border border-border shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
            <div className="flex gap-4 p-3">
              {/* Image - clickable */}
              <button
                onClick={handleImageClick}
                className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted hover:ring-2 hover:ring-primary/50 transition-all cursor-zoom-in"
              >
                {thumbnailLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                <Image
                  src={`/${selectedLocation.image}`}
                  alt={selectedLocation.name}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-300",
                    thumbnailLoading ? "opacity-0" : "opacity-100"
                  )}
                  priority
                  onLoad={() => setThumbnailLoading(false)}
                  onError={(e) => {
                    setThumbnailLoading(false)
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </button>
              
              {/* Info */}
              <div className="flex-1 min-w-0 py-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm">{selectedLocation.name}</h4>
                    <p className="text-xs text-muted-foreground">{selectedLocation.location}</p>
                  </div>
                  <button
                    onClick={handleClosePopup}
                    className="p-1 rounded-md hover:bg-muted transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  {(() => {
                    const config = activityConfig[selectedLocation.activity]
                    const Icon = config.icon
                    return (
                      <>
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                        <span className="text-xs text-muted-foreground">{config.label}</span>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
