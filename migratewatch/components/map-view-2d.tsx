"use client"

import { useEffect, useRef, useState } from "react"
import { useMobile } from "../hooks/use-mobile"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"
import { MapInfoCard } from "./map-info-card"
import { MapLabel } from "./map-label"
import { LatLngExpression, CircleMarker, Marker } from 'leaflet';

// Add type declaration for window.L
declare global {
  interface Window {
    L: typeof import('leaflet');
  }
}

interface MapView2DProps {
  selectedSpecies: SpeciesData
  dataLayers: DataLayers
  timelineData?: TimelineData
  onError?: (error: string) => void
}

// Define a type for the map styles
type MapStyle = "watercolor" | "terrain" | "satellite" | "dark" | "voyager"

export function MapView2D({ selectedSpecies, dataLayers, timelineData, onError }: MapView2DProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const isMobile = useMobile()
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<MapStyle>("watercolor") // Now using the MapStyle type

  // Add this code near the beginning of the component to manage info cards and labels
  const [activeInfoCard, setActiveInfoCard] = useState<{
    title: string
    position: { x: number; y: number }
    species: SpeciesData
    data: any
  } | null>(null)

  const [mapLabels, setMapLabels] = useState<
    {
      id: string
      text: string
      position: { x: number; y: number }
      type: "info" | "warning" | "success" | "neutral"
    }[]
  >([])

  // Initialize Leaflet map
  useEffect(() => {
    if (!scriptLoaded || !mapContainerRef.current) {
      console.log("Not ready to initialize map yet")
      return
    }

    // Check if leaflet is available
    if (typeof window === "undefined" || !window.L) {
      console.error("Leaflet is not available")
      setLoadError("Leaflet is not available. Please check the script loading.")
      if (onError) onError("Leaflet is not available. Please check the script loading.")
      return
    }

    console.log("Initializing Leaflet map")

    try {
      // Create a map instance
      const map = window.L.map(mapContainerRef.current, {
        center: [40.0, -70.0], // North Atlantic
        zoom: 5,
        minZoom: 3,
        maxZoom: 10,
        zoomControl: false, // We'll add custom zoom controls
        attributionControl: false,
      })

      console.log("Map created successfully")

      // Add beautiful base map layers
      const baseMaps: { [key in MapStyle]: any } = {
        // Stamen Watercolor - artistic watercolor style
        watercolor: window.L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg", {
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: "abcd",
          minZoom: 1,
          maxZoom: 16,
        }),

        // Stamen Terrain - beautiful terrain with hillshading
        terrain: window.L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png", {
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          subdomains: "abcd",
          minZoom: 0,
          maxZoom: 18,
        }),

        // ESRI World Imagery - satellite imagery
        satellite: window.L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          },
        ),

        // Carto Dark - for a sleek dark look
        dark: window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }),

        // Carto Voyager - colorful and detailed
        voyager: window.L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }),
      }

      // Add the default base map
      baseMaps[mapStyle].addTo(map)

      // Add ocean color overlay
      const oceanStyle = {
        color: "#4cc9f0",
        weight: 0,
        fillColor: "#4cc9f0",
        fillOpacity: 0.1,
      }

      // Simple ocean polygon (this would be more detailed in a real app)
      const oceanBounds: LatLngExpression[][] = [
        [
          [85, -180],
          [85, 180],
          [-85, 180],
          [-85, -180],
          [85, -180]
        ]
      ]

      const ocean = window.L.polygon(oceanBounds, oceanStyle).addTo(map)

      // Add style switcher control
      const StyleSwitcher = window.L.Control.extend({
        options: {
          position: "topright",
        },

        onAdd: (map: any) => {
          const container = window.L.DomUtil.create("div", "leaflet-bar leaflet-control style-switcher")
          container.style.backgroundColor = "white"
          container.style.padding = "5px"
          container.style.borderRadius = "4px"

          const title = document.createElement("div")
          title.innerHTML = "Map Style"
          title.style.fontWeight = "bold"
          title.style.marginBottom = "5px"
          title.style.fontSize = "12px"
          container.appendChild(title)

          const styles = [
            { id: "watercolor", name: "Watercolor" },
            { id: "terrain", name: "Terrain" },
            { id: "satellite", name: "Satellite" },
            { id: "dark", name: "Dark" },
            { id: "voyager", name: "Voyager" },
          ]

          styles.forEach((style) => {
            const btn = document.createElement("button")
            btn.innerHTML = style.name
            btn.style.display = "block"
            btn.style.width = "100%"
            btn.style.marginBottom = "3px"
            btn.style.padding = "3px 5px"
            btn.style.fontSize = "11px"
            btn.style.backgroundColor = style.id === mapStyle ? "#4cc9f0" : "#f0f0f0"
            btn.style.color = style.id === mapStyle ? "white" : "black"
            btn.style.border = "none"
            btn.style.borderRadius = "3px"
            btn.style.cursor = "pointer"

            btn.onclick = () => {
              // Remove all base layers
              Object.values(baseMaps).forEach((layer) => {
                if (map.hasLayer(layer)) {
                  map.removeLayer(layer)
                }
              })

              // Add the selected base layer
              baseMaps[style.id as MapStyle].addTo(map)
              setMapStyle(style.id as MapStyle)

              // Update button styles
              Array.from(container.getElementsByTagName("button")).forEach((b: any) => {
                b.style.backgroundColor = "#f0f0f0"
                b.style.color = "black"
              })
              btn.style.backgroundColor = "#4cc9f0"
              btn.style.color = "white"

              // Adjust ocean opacity based on style
              if (style.id === "dark" || style.id === "satellite") {
                ocean.setStyle({ fillOpacity: 0.2, fillColor: "#4cc9f0" })
              } else if (style.id === "watercolor") {
                ocean.setStyle({ fillOpacity: 0.05, fillColor: "#4cc9f0" })
              } else {
                ocean.setStyle({ fillOpacity: 0.1, fillColor: "#4cc9f0" })
              }
            }

            container.appendChild(btn)
          })

          return container
        },
      })

      new StyleSwitcher().addTo(map)

      // Store map reference
      mapRef.current = map

      // Add this to the map initialization code, after the map is created
      map.on("click", handleMapClick)

      // Add data layers with try/catch for each
      try {
        if (dataLayers.migrationRoutes) {
          addMigrationRoutes(map)
        }
      } catch (e: any) {
        console.error("Error adding migration routes:", e)
        if (onError) onError("Error adding migration routes: " + e.message)
      }

      try {
        if (dataLayers.shippingLanes) {
          addShippingLanes(map)
        }
      } catch (e: any) {
        console.error("Error adding shipping lanes:", e)
        if (onError) onError("Error adding shipping lanes: " + e.message)
      }

      try {
        if (dataLayers.conflictZones) {
          addConflictZones(map)
        }
      } catch (e: any) {
        console.error("Error adding conflict zones:", e)
        if (onError) onError("Error adding conflict zones: " + e.message)
      }

      try {
        if (dataLayers.seaTemperature) {
          addSeaTemperature(map)
        }
      } catch (e: any) {
        console.error("Error adding sea temperature:", e)
        if (onError) onError("Error adding sea temperature: " + e.message)
      }

      try {
        addProtectedAreas(map)
      } catch (e: any) {
        console.error("Error adding protected areas:", e)
        if (onError) onError("Error adding protected areas: " + e.message)
      }

      try {
        addAlternativeRoutes(map)
      } catch (e: any) {
        console.error("Error adding alternative routes:", e)
        if (onError) onError("Error adding alternative routes: " + e.message)
      }

      try {
        addAnimalPresenceHeatmap(map, selectedSpecies)
      } catch (e: any) {
        console.error("Error adding animal presence heatmap:", e)
        if (onError) onError("Error adding animal presence heatmap: " + e.message)
      }

      try {
        addRiskAssessment(map)
      } catch (e: any) {
        console.error("Error adding risk assessment:", e)
        if (onError) onError("Error adding risk assessment: " + e.message)
      }

      // Add a new function to create an information control panel that organizes all overlays
      function addInfoControlPanel(map: any) {
        try {
          // Create a control for toggling map overlays
          const InfoControl = window.L.Control.extend({
            options: {
              position: "bottomleft",
            },

            onAdd: (map: any) => {
              const div = window.L.DomUtil.create("div", "info-control")
              div.innerHTML = `
          <div class="bg-migratewatch-panel/90 p-3 rounded-lg shadow-lg border border-migratewatch-panel">
            <div class="font-bold mb-3 text-white text-sm flex items-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-2 text-migratewatch-cyan">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="6" x2="22" y2="12"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Map Layers
            </div>
            <div class="flex flex-col space-y-2">
              <label class="flex items-center space-x-2 text-xs bg-migratewatch-darker/50 p-2 rounded hover:bg-migratewatch-darker transition-colors">
                <input type="checkbox" class="toggle-overlay accent-migratewatch-cyan w-3.5 h-3.5" data-layer="risk" checked>
                <span class="flex items-center">
                  <span class="w-2 h-2 rounded-full bg-migratewatch-magenta mr-1.5"></span>
                  Risk Assessment
                </span>
              </label>
              <label class="flex items-center space-x-2 text-xs bg-migratewatch-darker/50 p-2 rounded hover:bg-migratewatch-darker transition-colors">
                <input type="checkbox" class="toggle-overlay accent-migratewatch-cyan w-3.5 h-3.5" data-layer="routes" checked>
                <span class="flex items-center">
                  <span class="w-3 h-0.5 bg-migratewatch-cyan mr-1.5"></span>
                  Migration Routes
                </span>
              </label>
              <label class="flex items-center space-x-2 text-xs bg-migratewatch-darker/50 p-2 rounded hover:bg-migratewatch-darker transition-colors">
                <input type="checkbox" class="toggle-overlay accent-migratewatch-cyan w-3.5 h-3.5" data-layer="shipping" checked>
                <span class="flex items-center">
                  <span class="w-3 h-0.5 bg-migratewatch-orange mr-1.5"></span>
                  Shipping Lanes
                </span>
              </label>
              <label class="flex items-center space-x-2 text-xs bg-migratewatch-darker/50 p-2 rounded hover:bg-migratewatch-darker transition-colors">
                <input type="checkbox" class="toggle-overlay accent-migratewatch-cyan w-3.5 h-3.5" data-layer="protected" checked>
                <span class="flex items-center">
                  <span class="w-3 h-0.5 bg-migratewatch-green mr-1.5"></span>
                  Protected Areas
                </span>
              </label>
              <label class="flex items-center space-x-2 text-xs bg-migratewatch-darker/50 p-2 rounded hover:bg-migratewatch-darker transition-colors">
                <input type="checkbox" class="toggle-overlay accent-migratewatch-cyan w-3.5 h-3.5" data-layer="labels" checked>
                <span class="flex items-center">
                  <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <polyline points="16 6 22 12 16 18"></polyline>
                  </svg>
                  Information Labels
                </span>
              </label>
            </div>
          </div>
        `

              // Prevent map clicks from propagating through the control
              window.L.DomEvent.disableClickPropagation(div)

              // Add toggle functionality
              const checkboxes = div.querySelectorAll(".toggle-overlay")
              checkboxes.forEach((checkbox) => {
                checkbox.addEventListener("change", (e) => {
                  const target = e.target as HTMLInputElement
                  const layer = target.dataset.layer
                  const checked = target.checked

                  // Toggle layer visibility based on checkbox
                  const elements = document.querySelectorAll(`.${layer}-element`)
                  elements.forEach((el) => {
                    ;(el as HTMLElement).style.display = checked ? "" : "none"
                  })
                })
              })

              return div
            },
          })

          new InfoControl().addTo(map)
        } catch (error: any) {
          console.error("Error adding info control panel:", error)
          if (onError) onError("Error adding info control panel: " + error.message)
        }
      }

      // Add scale control
      try {
        window.L.control
          .scale({
            imperial: false,
            position: "bottomleft",
          })
          .addTo(map)
      } catch (e: any) {
        console.error("Error adding scale control:", e)
        if (onError) onError("Error adding scale control: " + e.message)
      }

      // Add attribution in a custom position
      try {
        window.L.control
          .attribution({
            position: "bottomright",
          })
          .addTo(map)
          .setPrefix("MigrateWatch | Leaflet")
      } catch (e: any) {
        console.error("Error adding attribution control:", e)
        if (onError) onError("Error adding attribution control: " + e.message)
      }

      // Call the new function in the main useEffect after all other layers are added
      // Add this line before setMapLoaded(true):
      addInfoControlPanel(map)

      // Mark map as loaded
      console.log("Map fully initialized, setting mapLoaded to true")
      setMapLoaded(true)

      // Resize handler
      const handleResize = () => {
        map.invalidateSize()
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (map) {
          map.remove()
        }
      }
    } catch (error: any) {
      console.error("Failed to initialize Leaflet map:", error)
      setLoadError(error instanceof Error ? error.message : "Unknown error initializing map")
      if (onError) onError("Failed to initialize Leaflet map: " + error.message)
    }
  }, [scriptLoaded, dataLayers, selectedSpecies, onError, mapStyle])

  // Add a timeout to trigger fallback if map doesn't load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !loadError) {
        console.error("Map loading timeout reached")
        setLoadError("Map loading timeout reached")
        if (onError) onError("Map loading timeout reached")
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [mapLoaded, loadError, onError])

  // Add migration routes with confidence intervals
  function addMigrationRoutes(map: any) {
    try {
      // Main migration route
      const migrationPath: LatLngExpression[] = [
        [44.0, -67.0],
        [42.5, -70.0],
        [41.0, -71.0],
        [39.0, -74.0],
        [35.0, -75.5],
        [32.0, -80.0],
        [30.5, -81.5],
      ]

      // Create the main route with a glowing effect
      const mainRoute = window.L.polyline(migrationPath, {
        color: "#4cc9f0",
        weight: 4,
        opacity: 0.8,
        dashArray: "10, 5",
        className: "animated-dash routes-element", // Added routes-element class
      }).addTo(map)

      // Add confidence interval (wider path underneath)
      const confidenceInterval = window.L.polyline(migrationPath, {
        color: "#4cc9f0",
        weight: 12,
        opacity: 0.2,
        className: "routes-element", // Added routes-element class
      }).addTo(map)

      // Add confidence interval label with better styling
      window.L.marker([41.0, -71.0], {
        icon: window.L.divIcon({
          className: "confidence-label routes-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-panel/90 text-xs p-2 rounded-lg shadow-lg border border-migratewatch-cyan/30">
            <div class="font-bold text-migratewatch-cyan">95% Confidence Interval</div>
          </div>
        `,
          iconSize: [150, 40],
          iconAnchor: [75, 20], // Center the label horizontally
        }),
      }).addTo(map)

      // Define a type for the animated markers
      interface AnimatedMarker {
        marker: CircleMarker;
        speed: number;
        progress: number;
      }

      // Add multiple animated markers along the route for a school effect
      const animatedMarkers: AnimatedMarker[] = [];
      for (let i = 0; i < 5; i++) {
        const marker = window.L.circleMarker(migrationPath[0], {
          radius: 5,
          color: "#ffffff",
          fillColor: "#4cc9f0",
          fillOpacity: 1,
          weight: 2,
          className: "pulse-marker routes-element", // Added routes-element class
        }).addTo(map)

        animatedMarkers.push({
          marker,
          speed: 0.0005 + Math.random() * 0.0005, // Slightly different speeds
          progress: i * 0.15, // Spread them out
        })
      }

      // Animation function
      const animateMarkers = () => {
        if (!map) return

        animatedMarkers.forEach((item) => {
          // Calculate position along the path
          const totalSteps = 1
          const pathLength = migrationPath.length - 1

          // Update progress
          item.progress += item.speed
          if (item.progress > 1) {
            item.progress = 0
          }

          const segmentIndex = Math.floor(item.progress * pathLength)
          const segmentProgress = (item.progress * pathLength) % 1

          const start = migrationPath[segmentIndex]
          const end = migrationPath[Math.min(segmentIndex + 1, migrationPath.length - 1)]

          let startLat = 0, startLng = 0, endLat = 0, endLng = 0;
          
          if (Array.isArray(start)) {
            [startLat, startLng] = start as [number, number];
          }
          
          if (Array.isArray(end)) {
            [endLat, endLng] = end as [number, number];
          }
          
          const lat = startLat + (endLat - startLat) * segmentProgress
          const lng = startLng + (endLng - startLng) * segmentProgress

          // Update marker position
          item.marker.setLatLng([lat, lng])
        })

        // Continue animation
        requestAnimationFrame(animateMarkers)
      }

      // Start animation
      animateMarkers()

      // Add density information with better styling
      window.L.marker([39.0, -74.0], {
        icon: window.L.divIcon({
          className: "density-info routes-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-cyan text-black text-xs font-bold p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full bg-migratewatch-cyan mr-1.5 animate-pulse"></div>
              High Density Area
            </div>
          </div>
        `,
          iconSize: [120, 30],
        }),
      }).addTo(map)

      // Add whale icons at key points
      const whaleIcon = window.L.divIcon({
        className: "whale-icon routes-element", // Added routes-element class
        html: `
        <div class="relative">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="#4cc9f0" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="animate-pulse">
            <path d="M3 18c2.5 0 5-1.7 5-5s-2.5-5-5-5 5 10 5 10M19 18c-2.5 0-5-1.7-5-5s2.5-5 5-5-5 10-5 10M3 18h16"></path>
          </svg>
          <div class="absolute -bottom-1 -right-1 w-2 h-2 rounded-full bg-migratewatch-cyan animate-ping"></div>
        </div>
      `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      // Add whales at various points along the route
      const whalePositions: LatLngExpression[] = [
        [43.0, -68.0],
        [41.5, -70.5],
        [38.0, -74.5],
        [33.0, -78.0],
      ]

      whalePositions.forEach((pos) => {
        window.L.marker(pos, { icon: whaleIcon }).addTo(map)
      })
    } catch (error: any) {
      console.error("Error adding migration routes:", error)
      if (onError) onError("Error adding migration routes: " + error.message)
    }
  }

  // Add shipping lanes with vessel information
  function addShippingLanes(map: any) {
    try {
      // Shipping lane coordinates
      const shippingPath: LatLngExpression[] = [
        [40.7, -74.0],
        [42.0, -60.0],
        [45.0, -40.0],
        [48.0, -20.0],
        [50.0, -5.0],
        [51.5, 0.0],
      ]

      // Create the shipping lane with gradient effect
      const shippingLane = window.L.polyline(shippingPath, {
        color: "#ff9e00",
        weight: 3,
        opacity: 0.8,
        dashArray: "8, 4",
        className: "shipping-lane shipping-element", // Added shipping-element class
      }).addTo(map)

      // Add vessel count information with better styling
      window.L.marker([42.0, -60.0], {
        icon: window.L.divIcon({
          className: "vessel-info shipping-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-panel/90 text-xs p-2 rounded-lg shadow-lg border border-migratewatch-orange/30">
            <div class="font-bold text-migratewatch-orange">247 vessels/month</div>
          </div>
        `,
          iconSize: [130, 30],
        }),
      }).addTo(map)

      // Add vessel type breakdown with better styling
      window.L.marker([45.0, -40.0], {
        icon: window.L.divIcon({
          className: "vessel-type shipping-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-panel/90 text-xs p-2 rounded-lg shadow-lg border border-migratewatch-orange/30">
            <div class="font-bold mb-1 text-migratewatch-orange">Vessel Types</div>
            <div class="grid grid-cols-3 gap-1">
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full bg-migratewatch-orange mr-1"></div>
                <span>Cargo: 65%</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full bg-migratewatch-magenta mr-1"></div>
                <span>Tanker: 25%</span>
              </div>
              <div class="flex items-center">
                <div class="w-2 h-2 rounded-full bg-migratewatch-cyan mr-1"></div>
                <span>Other: 10%</span>
              </div>
            </div>
          </div>
        `,
          iconSize: [220, 60],
        }),
      }).addTo(map)

      // Add animated ship icons
      const shipIcon = window.L.divIcon({
        className: "ship-icon shipping-element", // Added shipping-element class
        html: `
        <div>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ff9e00" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2"></path>
            <path d="M4 15h16"></path>
            <path d="M4 15l2 7h12l2-7"></path>
            <path d="M2 11h20"></path>
            <path d="M12 2v6"></path>
          </svg>
        </div>
      `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      // Add ships at various points along the shipping lane
      const shipPositions: LatLngExpression[] = [
        [41.0, -70.0],
        [43.0, -55.0],
        [46.0, -35.0],
        [49.0, -15.0],
      ]

      const ships: Marker[] = []

      shipPositions.forEach((pos) => {
        const ship = window.L.marker(pos, { icon: shipIcon }).addTo(map)
        ships.push(ship)
      })

      // Animate ships
      let direction = 1
      const animateShips = () => {
        ships.forEach((ship, i) => {
          const pos = ship.getLatLng()
          // Move slightly in the direction of the shipping lane
          const newPos: LatLngExpression = [
            pos.lat + (Math.random() * 0.01 - 0.005) * direction,
            pos.lng + (Math.random() * 0.05 - 0.025) * direction,
          ]
          ship.setLatLng(newPos)
        })

        // Occasionally change direction
        if (Math.random() < 0.01) {
          direction *= -1
        }

        setTimeout(animateShips, 500)
      }

      animateShips()
    } catch (error: any) {
      console.error("Error adding shipping lanes:", error)
      if (onError) onError("Error adding shipping lanes: " + error.message)
    }
  }

  // Add conflict zones with risk assessment
  function addConflictZones(map: any) {
    try {
      // Add conflict zones as circles with pulsing effect
      const conflictZone1 = window.L.circle([42.0, -69.5], {
        color: "#f72585",
        fillColor: "#f72585",
        fillOpacity: 0.5,
        radius: 50000,
        className: "conflict-zone pulse-danger risk-element", // Added risk-element class
      }).addTo(map)

      const conflictZone2 = window.L.circle([38.5, -74.0], {
        color: "#f72585",
        fillColor: "#f72585",
        fillOpacity: 0.5,
        radius: 70000,
        className: "conflict-zone pulse-danger risk-element", // Added risk-element class
      }).addTo(map)

      // Add risk assessment labels with better styling
      window.L.marker([42.0, -69.5], {
        icon: window.L.divIcon({
          className: "risk-label risk-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-magenta text-white text-xs font-bold p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Risk: High (87%)
            </div>
          </div>
        `,
          iconSize: [120, 30],
        }),
      }).addTo(map)

      window.L.marker([38.5, -74.0], {
        icon: window.L.divIcon({
          className: "risk-label risk-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-magenta/80 text-white text-xs font-bold p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Risk: Medium (62%)
            </div>
          </div>
        `,
          iconSize: [140, 30],
        }),
      }).addTo(map)

      // Add distance measurement with better styling
      const distanceLine = window.L.polyline(
        [
          [42.0, -69.5],
          [42.0, -60.0],
        ],
        {
          color: "white",
          weight: 2,
          dashArray: "5, 5",
          opacity: 0.7,
          className: "risk-element", // Added risk-element class
        },
      ).addTo(map)

      window.L.marker([42.0, -65.0], {
        icon: window.L.divIcon({
          className: "distance-label risk-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-panel/90 text-xs p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <polyline points="16 6 22 12 16 18"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Distance: 432 km
            </div>
          </div>
        `,
          iconSize: [130, 30],
        }),
      }).addTo(map)
    } catch (error: any) {
      console.error("Error adding conflict zones:", error)
      if (onError) onError("Error adding conflict zones: " + error.message)
    }
  }

  // Update protected areas with better styling and organization
  function addProtectedAreas(map: any) {
    try {
      // Protected area polygon with pattern fill
      const protectedArea = window.L.polygon(
        [
          [43.0, -69.0],
          [43.0, -67.0],
          [41.0, -67.0],
          [41.0, -69.0],
        ],
        {
          color: "#4af699",
          fillColor: "#4af699",
          fillOpacity: 0.3,
          weight: 2,
          dashArray: "5, 5",
          className: "protected-area protected-element", // Added protected-element class
        },
      ).addTo(map)

      // Add label with better styling
      window.L.marker([42.0, -68.0], {
        icon: window.L.divIcon({
          className: "protected-label protected-element labels-element", // Added classes for toggling
          html: `
          <div class="bg-migratewatch-green text-black text-xs font-bold p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Protected Marine Area
            </div>
          </div>
        `,
          iconSize: [170, 30],
        }),
      }).addTo(map)
    } catch (error: any) {
      console.error("Error adding protected areas:", error)
      if (onError) onError("Error adding protected areas: " + error.message)
    }
  }

  // Add alternative routes
  function addAlternativeRoutes(map: any) {
    try {
      // Current route
      const currentRoute = window.L.polyline(
        [
          [40.7, -74.0],
          [41.0, -71.0],
        ],
        {
          color: "gray",
          weight: 3,
          opacity: 0.5,
          dashArray: "10, 10",
        },
      ).addTo(map)

      // Alternative route
      const alternativeRoute = window.L.polyline(
        [
          [40.7, -74.0],
          [41.3, -69.0],
        ],
        {
          color: "#4af699",
          weight: 4,
          opacity: 0.7,
        },
      ).addTo(map)

      // Add labels with better styling
      window.L.marker([41.0, -71.0], {
        icon: window.L.divIcon({
          className: "current-route-label",
          html: `
            <div class="bg-migratewatch-panel/80 text-xs p-2 rounded shadow-lg">
              <div class="flex items-center">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                  <polyline points="1 4 1 9 4 12 9 16 14 12 19 16 23 12"></polyline>
                </svg>
                Current Route
              </div>
            </div>
          `,
          iconSize: [120, 30],
        }),
      }).addTo(map)

      window.L.marker([41.3, -69.0], {
        icon: window.L.divIcon({
          className: "alternative-route-label",
          html: `
            <div class="bg-migratewatch-green text-black text-xs font-bold p-2 rounded shadow-lg">
              <div class="flex items-center">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                  <polyline points="1 4 1 9 4 12 9 16 14 12 19 16 23 12"></polyline>
                </svg>
                Alternative Route
              </div>
            </div>
          `,
          iconSize: [130, 30],
        }),
      }).addTo(map)
    } catch (error: any) {
      console.error("Error adding alternative routes:", error)
      if (onError) onError("Error adding alternative routes: " + error.message)
    }
  }

  // Placeholder functions for data layers
  function addSeaTemperature(map: any) {
    // Placeholder for sea temperature layer
    console.log("Adding sea temperature layer")
  }

  function addAnimalPresenceHeatmap(map: any, selectedSpecies: SpeciesData) {
    // Placeholder for animal presence heatmap
    console.log("Adding animal presence heatmap for", selectedSpecies.name)
  }

  function addRiskAssessment(map: any) {
    // Placeholder for risk assessment layer
    console.log("Adding risk assessment layer")
  }

  // Load Leaflet script dynamically
  useEffect(() => {
    const leafletScriptUrl = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"

    const script = document.createElement("script")
    script.src = leafletScriptUrl
    script.async = true
    script.onload = () => {
      console.log("Leaflet script loaded successfully")
      setScriptLoaded(true)
    }
    script.onerror = () => {
      console.error("Failed to load Leaflet script")
      setLoadError("Failed to load Leaflet library. Please check your internet connection.")
      setScriptLoaded(false)
      if (onError) onError("Failed to load Leaflet library. Please check your internet connection.")
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [onError])

  // Add this function to handle map clicks
  const handleMapClick = (e: any) => {
    // Get click coordinates
    const { lat, lng } = e.latlng

    // Check if click is near a conflict zone
    const conflictZones = [
      { lat: 42.0, lng: -69.5, risk: "High", percentage: 87 },
      { lat: 38.5, lng: -74.0, risk: "Medium", percentage: 62 },
    ]

    // Find the nearest conflict zone
    const nearestZone = conflictZones.find((zone) => {
      const distance = Math.sqrt(Math.pow(zone.lat - lat, 2) + Math.pow(zone.lng - lng, 2))
      return distance < 2 // Within ~200km
    })

    if (nearestZone) {
      // Convert lat/lng to pixel coordinates
      const point = mapRef.current.latLngToContainerPoint([nearestZone.lat, nearestZone.lng])

      setActiveInfoCard({
        title: "Conflict Zone Analysis",
        position: { x: point.x, y: point.y },
        species: selectedSpecies,
        data: {
          riskLevel: nearestZone.risk,
          riskPercentage: nearestZone.percentage,
          vesselCount: 247,
          recommendedAction: "Seasonal speed restriction",
          alternativeRoute: {
            distance: "+42 km (+8%)",
            riskReduction: "65%",
            timeImpact: "+2.5 hours",
          },
        },
      })

      // Add some contextual labels
      setMapLabels([
        {
          id: "risk-label-1",
          text: "High whale density",
          position: {
            x: point.x - 100,
            y: point.y - 50,
          },
          type: "info",
        },
        {
          id: "risk-label-2",
          text: "Recommended detour",
          position: {
            x: point.x + 100,
            y: point.y - 30,
          },
          type: "success",
        },
      ])
    } else {
      // Clear info card and labels if clicking elsewhere
      setActiveInfoCard(null)
      setMapLabels([])
    }
  }

  return (
    <>
      {loadError && (
        <div className="bg-red-500 text-white p-2 rounded mb-2">{loadError}</div>
      )}
      <div ref={mapContainerRef} className="map-container" style={{ height: "600px", width: "100%" }}></div>

      {/* Add the MapInfoCard component */}
      {activeInfoCard && (
        <MapInfoCard
          title={activeInfoCard.title}
          position={activeInfoCard.position}
          species={activeInfoCard.species}
          data={activeInfoCard.data}
          onClose={() => setActiveInfoCard(null)}
        />
      )}

      {/* Add the MapLabel components */}
      {mapLabels.map((label) => (
        <MapLabel key={label.id} text={label.text} position={label.position} type={label.type} />
      ))}
    </>
  )
}
