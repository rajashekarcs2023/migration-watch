"use client"

import { useEffect, useRef, useState } from "react"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"
import { fetchMigrationData, fetchShippingLaneData } from "@/lib/api"

interface MapView2DProps {
  selectedSpecies: SpeciesData
  selectedYear: string
  selectedMonth: string
  dataLayers: DataLayers
  timelineData: TimelineData
  onError?: () => void
}

export function MapView2D({
  selectedSpecies,
  selectedYear,
  selectedMonth,
  dataLayers,
  timelineData,
  onError,
}: MapView2DProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [mapStyle, setMapStyle] = useState<string>("dark") // Default to dark style

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

  // Inside the MapView2D component, add this state and effect
  const [apiMigrationPath, setApiMigrationPath] = useState<[number, number][]>([])
  const [apiShippingLanePath, setApiShippingLanePath] = useState<[number, number][]>([])

  // Add this useEffect near the beginning of the component
  useEffect(() => {
    const loadMigrationData = async () => {
      try {
        const data = await fetchMigrationData(selectedSpecies.name, selectedYear, selectedMonth)

        if (data.noDataFound) {
          // No data found, set empty array
          setApiMigrationPath([])
        } else if (data && data.coordinates && data.coordinates.length > 0) {
          // Convert coordinates to the format expected by Leaflet [lat, lng]
          const formattedCoordinates = data.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
          setApiMigrationPath(formattedCoordinates)
        } else {
          // Fallback to empty array
          setApiMigrationPath([])
        }
      } catch (error) {
        console.error("Error fetching migration data:", error)
        setApiMigrationPath([])
      }
    }

    loadMigrationData()
  }, [selectedSpecies, selectedYear, selectedMonth])

  // Add this useEffect to fetch shipping lane data
  useEffect(() => {
    const loadShippingLaneData = async () => {
      if (!dataLayers.shippingLanes) {
        // Don't fetch if shipping lanes are not enabled
        setApiShippingLanePath([])
        return
      }

      try {
        const data = await fetchShippingLaneData(selectedYear, selectedMonth)

        if (data.noDataFound) {
          // No data found, set empty array
          setApiShippingLanePath([])
        } else if (data && data.coordinates && data.coordinates.length > 0) {
          // Convert coordinates to the format expected by Leaflet [lat, lng]
          const formattedCoordinates = data.coordinates.map((coord: [number, number]) => [coord[1], coord[0]])
          setApiShippingLanePath(formattedCoordinates)
        } else {
          // Fallback to empty array
          setApiShippingLanePath([])
        }
      } catch (error) {
        console.error("Error fetching shipping lane data:", error)
        setApiShippingLanePath([])
      }
    }

    loadShippingLaneData()
  }, [selectedYear, selectedMonth, dataLayers.shippingLanes])

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
      if (onError) onError()
      return
    }

    console.log("Initializing Leaflet map")

    try {
      // Create a map instance
      const map = window.L.map(mapContainerRef.current, {
        center: [-5.0, 15.0], // Updated to center on your shipping lanes
        zoom: 4, // Adjusted zoom level
        minZoom: 3,
        maxZoom: 10,
        zoomControl: false, // We'll add custom zoom controls
        attributionControl: false,
      })

      console.log("Map created successfully")

      // Add beautiful base map layers
      const baseMaps = {
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
      const oceanBounds = [
        [
          [85, -180],
          [85, 180],
          [-85, 180],
          [-85, -180],
        ],
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
            { id: "dark", name: "Dark" },
            { id: "satellite", name: "Satellite" },
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
              baseMaps[style.id].addTo(map)
              setMapStyle(style.id)

              // Update button styles
              Array.from(container.getElementsByTagName("button")).forEach((b: any) => {
                b.style.backgroundColor = "#f0f0f0"
                b.style.color = "black"
              })
              btn.style.backgroundColor = "#4cc9f0"
              btn.style.color = "white"

              // Adjust ocean opacity based on style
              if (style.id === "satellite") {
                ocean.setStyle({ fillOpacity: 0.2, fillColor: "#4cc9f0" })
              } else if (style.id === "voyager") {
                ocean.setStyle({ fillOpacity: 0.1, fillColor: "#4cc9f0" })
              } else {
                // dark style
                ocean.setStyle({ fillOpacity: 0.15, fillColor: "#4cc9f0" })
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
      } catch (e) {
        console.error("Error adding migration routes:", e)
      }

      try {
        if (dataLayers.shippingLanes) {
          addShippingLanes(map)
        }
      } catch (e) {
        console.error("Error adding shipping lanes:", e)
      }

      try {
        if (dataLayers.conflictZones) {
          addConflictZones(map)
        }
      } catch (e) {
        console.error("Error adding conflict zones:", e)
      }

      try {
        if (dataLayers.seaTemperature) {
          addSeaTemperature(map)
        }
      } catch (e) {
        console.error("Error adding sea temperature:", e)
      }

      try {
        addProtectedAreas(map)
      } catch (e) {
        console.error("Error adding protected areas:", e)
      }

      try {
        addAlternativeRoutes(map)
      } catch (e) {
        console.error("Error adding alternative routes:", e)
      }

      try {
        addAnimalPresenceHeatmap(map, selectedSpecies)
      } catch (e) {
        console.error("Error adding animal presence heatmap:", e)
      }

      try {
        addRiskAssessment(map)
      } catch (e) {
        console.error("Error adding risk assessment:", e)
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
              <line x1="3" y1="9" x2="21" y2="9"></line>
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
                <span class="w-3 h-3 rounded-full bg-migratewatch-cyan mr-1.5"></span>
                Migration Points
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
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                  <polyline points="3 7 12 13 21 7"></polyline>
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
        } catch (error) {
          console.error("Error adding info control panel:", error)
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
      } catch (e) {
        console.error("Error adding scale control:", e)
      }

      // Add attribution in a custom position
      try {
        window.L.control
          .attribution({
            position: "bottomright",
          })
          .addTo(map)
          .setPrefix("MigrateWatch | Leaflet")
      } catch (e) {
        console.error("Error adding attribution control:", e)
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
    } catch (error) {
      console.error("Failed to initialize Leaflet map:", error)
      setLoadError(error instanceof Error ? error.message : "Unknown error initializing map")
      if (onError) onError()
    }
  }, [
    scriptLoaded,
    dataLayers,
    selectedSpecies,
    selectedYear,
    selectedMonth,
    onError,
    mapStyle,
    apiMigrationPath,
    apiShippingLanePath,
  ])

  // Add a timeout to trigger fallback if map doesn't load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!mapLoaded && !loadError) {
        console.error("Map loading timeout reached")
        setLoadError("Map loading timeout reached")
        if (onError) onError()
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [mapLoaded, loadError, onError])

  // Then modify the addMigrationRoutes function to use the API data
  function addMigrationRoutes(map: any) {
    try {
      // Don't add any routes if no data found or empty coordinates
      if (apiMigrationPath.length === 0) {
        console.log("No migration data to display in 2D map")
        return
      }

      // Use API data
      const migrationPath = apiMigrationPath

      // Add each coordinate as a separate circle marker
      migrationPath.forEach((coord) => {
        window.L.circleMarker(coord, {
          radius: 6,
          color: "#ffffff",
          fillColor: "#4cc9f0",
          fillOpacity: 1,
          weight: 2,
          className: "routes-element", // Added routes-element class
        }).addTo(map)
      })

      // Add a few animated markers for visual interest
      const animatedMarkers = []
      const numAnimatedMarkers = Math.min(5, migrationPath.length)
      const animatedIndices = []

      // Select random points to animate
      while (animatedIndices.length < numAnimatedMarkers) {
        const idx = Math.floor(Math.random() * migrationPath.length)
        if (!animatedIndices.includes(idx)) {
          animatedIndices.push(idx)
        }
      }

      // Create animated markers
      animatedIndices.forEach((idx) => {
        const marker = window.L.circleMarker(migrationPath[idx], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#4cc9f0",
          fillOpacity: 0.8,
          weight: 2,
          className: "pulse-marker routes-element", // Added animation class
        }).addTo(map)

        animatedMarkers.push(marker)
      })

      // Add density information with better styling
      if (migrationPath.length > 0) {
        window.L.marker([migrationPath[0][0], migrationPath[0][1]], {
          icon: window.L.divIcon({
            className: "density-info routes-element labels-element", // Added classes for toggling
            html: `
          <div class="bg-migratewatch-cyan text-black text-xs font-bold p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full bg-migratewatch-cyan mr-1 animate-pulse"></div>
              High Density Area
            </div>
          </div>
        `,
            iconSize: [120, 30],
          }),
        }).addTo(map)
      }

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
      if (migrationPath.length >= 4) {
        const whalePositions = [
          migrationPath[0],
          migrationPath[Math.floor(migrationPath.length / 3)],
          migrationPath[Math.floor((migrationPath.length * 2) / 3)],
          migrationPath[migrationPath.length - 1],
        ]

        whalePositions.forEach((pos) => {
          window.L.marker(pos, { icon: whaleIcon }).addTo(map)
        })
      }
    } catch (error) {
      console.error("Error adding migration routes:", error)
    }
  }

  // Update the shipping lanes function to use the API data
  function addShippingLanes(map: any) {
    try {
      // Don't add any shipping lanes if no data found or empty coordinates
      if (apiShippingLanePath.length === 0) {
        console.log("No shipping lane data to display in 2D map")
        return
      }

      // Create the shipping lane using API data
      const shippingLane = window.L.polyline(apiShippingLanePath, {
        color: "#ff9e00",
        weight: 3,
        opacity: 0.8,
        dashArray: "8, 4",
        className: "shipping-lane shipping-element",
      }).addTo(map)

      // Add tooltip with information
      shippingLane.bindTooltip("Shipping Lane", {
        permanent: false,
        direction: "top",
        className: "shipping-lane-tooltip",
      })

      // Calculate the midpoint of the line for label placement
      const midIndex = Math.floor(apiShippingLanePath.length / 2)
      const midPoint = apiShippingLanePath[midIndex]

      // Add a label for the shipping lane
      window.L.marker(midPoint, {
        icon: window.L.divIcon({
          className: "custom-lane-label shipping-element labels-element",
          html: `
          <div class="bg-migratewatch-orange text-black text-xs font-bold p-2 rounded-lg shadow-lg">
            <div class="flex items-center">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" class="mr-1">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"></path>
              </svg>
              Shipping Lane
            </div>
          </div>
        `,
          iconSize: [200, 30],
        }),
      }).addTo(map)

      // Add vessel count information with better styling
      window.L.marker([midPoint[0] + 2, midPoint[1]], {
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
      window.L.marker([midPoint[0] - 2, midPoint[1]], {
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

      // Add ship icons along the shipping lane
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
      const numShips = Math.min(4, Math.floor(apiShippingLanePath.length / 3))
      const ships = []

      for (let i = 0; i < numShips; i++) {
        const index = Math.floor((i / numShips) * apiShippingLanePath.length)
        const pos = apiShippingLanePath[index]
        const ship = window.L.marker(pos, { icon: shipIcon }).addTo(map)
        ships.push(ship)
      }

      // Animate ships
      let direction = 1
      const animateShips = () => {
        ships.forEach((ship, i) => {
          const pos = ship.getLatLng()
          // Move slightly in the direction of the shipping lane
          const newPos = [
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
    } catch (error) {
      console.error("Error in addShippingLanes function for 2D map:", error)
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
    } catch (error) {
      console.error("Error adding conflict zones:", error)
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
    } catch (error) {
      console.error("Error adding protected areas:", error)
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
    } catch (error) {
      console.error("Error adding alternative routes:", error)
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
      if (onError) onError()
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
        <div className="error-message">
          Error: {loadError}. Please ensure Leaflet is correctly loaded and your network connection is stable.
        </div>
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

// MapInfoCard component
function MapInfoCard({ title, position, species, data, onClose }: any) {
  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">Species: {species.name}</p>
      <div className="mb-2">
        <h4 className="text-md font-semibold">Risk Assessment</h4>
        <p className="text-sm">
          Risk Level: {data.riskLevel} ({data.riskPercentage}%)
        </p>
        <p className="text-sm">Vessel Count: {data.vesselCount} vessels/month</p>
      </div>
      <div>
        <h4 className="text-md font-semibold">Recommended Action</h4>
        <p className="text-sm">{data.recommendedAction}</p>
      </div>
      <div className="mt-2">
        <h4 className="text-md font-semibold">Alternative Route</h4>
        <p className="text-sm">Distance: {data.alternativeRoute.distance}</p>
        <p className="text-sm">Risk Reduction: {data.alternativeRoute.riskReduction}</p>
        <p className="text-sm">Time Impact: {data.alternativeRoute.timeImpact}</p>
      </div>
    </div>
  )
}

// MapLabel component
function MapLabel({ text, position, type }: any) {
  let bgColor = "bg-gray-100"
  let textColor = "text-gray-700"

  switch (type) {
    case "info":
      bgColor = "bg-blue-100"
      textColor = "text-blue-700"
      break
    case "warning":
      bgColor = "bg-yellow-100"
      textColor = "text-yellow-700"
      break
    case "success":
      bgColor = "bg-green-100"
      textColor = "text-green-700"
      break
    case "neutral":
    default:
      bgColor = "bg-gray-100"
      textColor = "text-gray-700"
      break
  }

  return (
    <div
      className={`absolute rounded-full px-3 py-1 text-xs font-medium ${bgColor} ${textColor} z-50`}
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      {text}
    </div>
  )
}

