"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"
import { Maximize, Minimize, Globe, MapIcon, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import Script from "next/script"
import { MapView2D } from "./map-view-2d"
import { MapView2DFallback } from "./map-view-2d-fallback"
import { fetchMigrationData, fetchShippingLaneData } from "@/lib/api"

// Declare Cesium as a global variable
declare global {
  interface Window {
    Cesium: any
  }
}

interface MapVisualizationProps {
  selectedSpecies: SpeciesData
  selectedYear: string
  selectedMonth: string
  dataLayers: DataLayers
  timelineData: TimelineData
  is3DView: boolean
  setIs3DView: (is3D: boolean) => void
}

export function MapVisualization({
  selectedSpecies,
  selectedYear,
  selectedMonth,
  dataLayers,
  timelineData,
  is3DView,
  setIs3DView,
}: MapVisualizationProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const cesiumContainerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [cesiumLoaded, setCesiumLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [viewChanging, setViewChanging] = useState(false)
  const animationFrameIdRef = useRef<number | null>(null)
  const cesiumRef = useRef<any>(null)
  const leafletMapRef = useRef<any>(null)
  const [map2DFailed, setMap2DFailed] = useState(false)
  const [migrationCoordinates, setMigrationCoordinates] = useState<[number, number][]>([])
  const [shippingLaneCoordinates, setShippingLaneCoordinates] = useState<[number, number][]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // Add a refresh key to force re-renders
  const [noDataFound, setNoDataFound] = useState(false)

  // Force cleanup and recreation of Cesium when key props change
  useEffect(() => {
    console.log("Key props changed, cleaning up Cesium")
    // Clean up previous viewer if it exists
    if (viewerRef.current) {
      try {
        console.log("Destroying previous Cesium viewer")
        viewerRef.current.destroy()
        viewerRef.current = null
      } catch (e) {
        console.error("Error destroying viewer:", e)
      }
    }

    // Cancel any animation frames
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }

    // Reset loading states
    setCesiumLoaded(false)

    // Reset error state
    setLoadError(null)

    // Force reload of Cesium script
    setScriptLoaded(false)
    setTimeout(() => {
      setScriptLoaded(true)
    }, 100)
  }, [selectedSpecies, selectedYear, selectedMonth, refreshKey])

  // Fetch migration data when species, year, or month changes
  useEffect(() => {
    const loadMigrationData = async () => {
      setIsLoadingData(true)
      try {
        // Use the scientific name from the selected species
        const data = await fetchMigrationData(selectedSpecies.name, selectedYear, selectedMonth)

        if (data.noDataFound) {
          // Set an empty array for coordinates and set a flag for no data found
          setMigrationCoordinates([])
          setNoDataFound(true)
        } else if (data && data.coordinates && data.coordinates.length > 0) {
          setMigrationCoordinates(data.coordinates)
          setNoDataFound(false)
        } else {
          // Fallback case - should not happen with our new API response format
          setMigrationCoordinates([])
          setNoDataFound(true)
        }
      } catch (error) {
        console.error("Error fetching migration data:", error)
        setMigrationCoordinates([])
        setNoDataFound(true)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadMigrationData()
  }, [selectedSpecies, selectedYear, selectedMonth, refreshKey])

  // Fetch shipping lane data when year or month changes
  useEffect(() => {
    const loadShippingLaneData = async () => {
      if (!dataLayers.shippingLanes) {
        // Don't fetch if shipping lanes are not enabled
        setShippingLaneCoordinates([])
        return
      }

      setIsLoadingData(true)
      try {
        const data = await fetchShippingLaneData(selectedYear, selectedMonth)

        if (data.noDataFound) {
          setShippingLaneCoordinates([])
        } else if (data && data.coordinates && data.coordinates.length > 0) {
          setShippingLaneCoordinates(data.coordinates)
        } else {
          setShippingLaneCoordinates([])
        }
      } catch (error) {
        console.error("Error fetching shipping lane data:", error)
        setShippingLaneCoordinates([])
      } finally {
        setIsLoadingData(false)
      }
    }

    loadShippingLaneData()
  }, [selectedYear, selectedMonth, dataLayers.shippingLanes, refreshKey])

  // Initialize Cesium after script is loaded (for 3D view)
  useEffect(() => {
    if (!is3DView || !scriptLoaded || !cesiumContainerRef.current || isLoadingData) return

    // Make sure Cesium is available
    if (!window.Cesium) {
      setLoadError("Cesium is not available. Please check the script loading.")
      setCesiumLoaded(true)
      setViewChanging(false)
      return
    }

    // Store Cesium reference
    cesiumRef.current = window.Cesium

    // Clean up previous viewer if it exists
    if (viewerRef.current) {
      try {
        viewerRef.current.destroy()
      } catch (e) {
        console.error("Error destroying viewer:", e)
      }
      viewerRef.current = null
    }

    try {
      const Cesium = window.Cesium

      // Create the Cesium viewer with minimal options
      const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
        baseLayerPicker: false,
        geocoder: false,
        homeButton: false,
        infoBox: false,
        navigationHelpButton: false,
        animation: false,
        timeline: false,
        fullscreenButton: false,
        vrButton: false,
        selectionIndicator: false,
        imageryProvider: new Cesium.TileMapServiceImageryProvider({
          url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
        }),
        // Disable skyBox and skyAtmosphere to avoid errors
        skyBox: false,
        skyAtmosphere: false,
        requestRenderMode: true,
        maximumRenderTimeChange: Number.POSITIVE_INFINITY,
      })

      // Disable atmosphere completely to avoid errors
      if (viewer.scene) {
        if (viewer.scene.skyAtmosphere) {
          viewer.scene.skyAtmosphere.show = false
        }

        if (viewer.scene.globe) {
          viewer.scene.globe.enableLighting = false

          // Disable atmosphere effects if they exist
          if ("showGroundAtmosphere" in viewer.scene.globe) {
            viewer.scene.globe.showGroundAtmosphere = false
          }
        }
      }

      // Remove default credits display if it exists
      if (viewer._cesiumWidget && viewer._cesiumWidget._creditContainer) {
        viewer._cesiumWidget._creditContainer.style.display = "none"
      }

      // Store reference
      viewerRef.current = viewer

      // Initial view - with error handling
      try {
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(-25.0, 15.0, 8000000), // Updated to center on your shipping lanes
          complete: () => {
            try {
              // Add basic data to the map
              if (dataLayers.migrationRoutes && !noDataFound && migrationCoordinates.length > 0) {
                addMigrationRoutes(Cesium, viewer)
              }

              if (dataLayers.shippingLanes && shippingLaneCoordinates.length > 0) {
                addShippingLanes(Cesium, viewer)
              }

              if (dataLayers.conflictZones) {
                addConflictZones(Cesium, viewer)
              }

              setCesiumLoaded(true)
              setViewChanging(false)

              // Start animation for migration routes
              if (dataLayers.migrationRoutes && !noDataFound && migrationCoordinates.length > 0) {
                startMigrationAnimation(Cesium, viewer)
              }
            } catch (error) {
              console.error("Error adding data layers:", error)
              setCesiumLoaded(true)
              setViewChanging(false)
            }
          },
        })
      } catch (error) {
        console.error("Error during camera flyTo:", error)
        setCesiumLoaded(true)
        setViewChanging(false)

        // Try to add data anyway
        try {
          if (dataLayers.migrationRoutes && !noDataFound && migrationCoordinates.length > 0) {
            addMigrationRoutes(Cesium, viewer)
          }

          if (dataLayers.shippingLanes && shippingLaneCoordinates.length > 0) {
            addShippingLanes(Cesium, viewer)
          }

          if (dataLayers.conflictZones) {
            addConflictZones(Cesium, viewer)
          }
        } catch (e) {
          console.error("Error adding data after camera error:", e)
        }
      }
    } catch (error) {
      console.error("Failed to initialize Cesium:", error)
      setLoadError(error instanceof Error ? error.message : "Unknown error initializing Cesium")
      setCesiumLoaded(true)
      setViewChanging(false)
    }

    return () => {
      // Cancel animation frame
      if (animationFrameIdRef.current !== null) {
        cancelAnimationFrame(animationFrameIdRef.current)
        animationFrameIdRef.current = null
      }

      // Destroy viewer
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy()
        } catch (e) {
          console.error("Error destroying viewer:", e)
        }
        viewerRef.current = null
      }
    }
  }, [
    scriptLoaded,
    is3DView,
    dataLayers,
    migrationCoordinates,
    shippingLaneCoordinates,
    isLoadingData,
    selectedSpecies,
    selectedYear,
    selectedMonth,
    refreshKey,
    noDataFound,
  ])

  // Add migration routes
  function addMigrationRoutes(Cesium: any, viewer: any) {
    try {
      // Don't add any routes if no data found or empty coordinates
      if (noDataFound || migrationCoordinates.length === 0) {
        console.log("No migration data to display")
        return
      }

      // Use the fetched coordinates
      const coordinates = migrationCoordinates

      // Add each coordinate as a separate point entity
      coordinates.forEach((coord) => {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1]),
          point: {
            pixelSize: 8,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
        })
      })
    } catch (error) {
      console.error("Error adding migration routes:", error)
    }
  }

  // Replace the startMigrationAnimation function with this version
  // We don't need the animation for static points, but we'll keep a simplified version
  function startMigrationAnimation(Cesium: any, viewer: any) {
    if (!viewer || viewer.isDestroyed()) return

    // Don't animate if no data found or empty coordinates
    if (noDataFound || migrationCoordinates.length === 0) {
      console.log("No migration data to animate")
      return
    }

    // Cancel any existing animation
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }

    // Use the fetched coordinates
    const positions = migrationCoordinates

    // We'll add a pulsing effect to a few random points
    try {
      // Select a few random points to animate
      const randomIndices = []
      const numAnimatedPoints = Math.min(5, positions.length)

      while (randomIndices.length < numAnimatedPoints) {
        const idx = Math.floor(Math.random() * positions.length)
        if (!randomIndices.includes(idx)) {
          randomIndices.push(idx)
        }
      }

      // Create animated points at these positions
      const entities: any[] = []

      randomIndices.forEach((idx) => {
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(positions[idx][0], positions[idx][1]),
          point: {
            pixelSize: 12,
            color: Cesium.Color.CYAN.withAlpha(0.7),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
        })

        entities.push({
          entity,
          originalSize: 12,
          growing: true,
        })
      })

      // Animation function for pulsing effect
      const animate = () => {
        if (!viewer.isDestroyed()) {
          try {
            entities.forEach((item) => {
              // Create pulsing effect
              if (item.growing) {
                item.entity.point.pixelSize = item.originalSize * 1.5
                item.growing = false
              } else {
                item.entity.point.pixelSize = item.originalSize
                item.growing = true
              }
            })

            // Slower animation rate for pulsing
            setTimeout(() => {
              animationFrameIdRef.current = requestAnimationFrame(animate)
            }, 500)
          } catch (error) {
            console.error("Error in animation loop:", error)
          }
        }
      }

      animate()
    } catch (error) {
      console.error("Error setting up animation:", error)
    }
  }

  // Add shipping lanes
  function addShippingLanes(Cesium: any, viewer: any) {
    try {
      // Don't add any shipping lanes if no data found or empty coordinates
      if (shippingLaneCoordinates.length === 0) {
        console.log("No shipping lane data to display")
        return
      }

      // Convert coordinates to Cesium format
      const cesiumCoords = []
      for (const coord of shippingLaneCoordinates) {
        cesiumCoords.push(coord[0], coord[1])
      }

      // Add the shipping lane
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(cesiumCoords),
          width: 3,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.ORANGE,
          }),
        },
        properties: {
          type: "shipping-lane",
          laneType: "Standard",
          id: "standard",
          name: "Shipping Lane",
        },
      })

      // Add a label for the shipping lane
      const midIndex = Math.floor(shippingLaneCoordinates.length / 2)
      if (midIndex < shippingLaneCoordinates.length) {
        viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(
            shippingLaneCoordinates[midIndex][0],
            shippingLaneCoordinates[midIndex][1],
            100000, // Height above surface
          ),
          label: {
            text: "Shipping Lane",
            font: "14px sans-serif",
            fillColor: Cesium.Color.ORANGE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
            pixelOffset: new Cesium.Cartesian2(0, -10),
            translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e7, 0.0),
          },
        })
      }
    } catch (error) {
      console.error("Error in addShippingLanes function:", error)
    }
  }

  // Add conflict zones
  function addConflictZones(Cesium: any, viewer: any) {
    try {
      // Add a conflict zone near Cape Cod
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-69.5, 42.0),
        ellipse: {
          semiMinorAxis: 50000,
          semiMajorAxis: 50000,
          material: Cesium.Color.MAGENTA.withAlpha(0.5),
        },
      })

      // Add another conflict zone
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(-74.0, 38.5),
        ellipse: {
          semiMinorAxis: 70000,
          semiMajorAxis: 70000,
          material: Cesium.Color.MAGENTA.withAlpha(0.5),
        },
      })
    } catch (error) {
      console.error("Error adding conflict zones:", error)
    }
  }

  const handleZoomIn = () => {
    if (is3DView && viewerRef.current) {
      try {
        viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.2)
      } catch (error) {
        console.error("Error zooming in:", error)
      }
    } else if (!is3DView && leafletMapRef.current) {
      try {
        leafletMapRef.current.zoomIn()
      } catch (error) {
        console.error("Error zooming in 2D map:", error)
      }
    }
  }

  const handleZoomOut = () => {
    if (is3DView && viewerRef.current) {
      try {
        viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.2)
      } catch (error) {
        console.error("Error zooming out:", error)
      }
    } else if (!is3DView && leafletMapRef.current) {
      try {
        leafletMapRef.current.zoomOut()
      } catch (error) {
        console.error("Error zooming out 2D map:", error)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const toggleViewMode = () => {
    setViewChanging(true)

    // Cancel any animation frames
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }

    // Toggle the view mode
    setIs3DView(!is3DView)

    // Reset loading state after a short delay to allow for transition
    setTimeout(() => {
      setViewChanging(false)
    }, 500)
  }

  // Add a safety timeout for loading state
  useEffect(() => {
    if (viewChanging) {
      const timeout = setTimeout(() => {
        console.log("Loading timeout reached, resetting loading state")
        setViewChanging(false)
      }, 3000) // 3 second timeout

      return () => clearTimeout(timeout)
    }
  }, [viewChanging])

  // Function to force refresh the map
  const forceRefresh = () => {
    console.log("Manual refresh triggered")
    setViewChanging(true)
    setRefreshKey((prev) => prev + 1)

    // Reset loading state after a delay
    setTimeout(() => {
      setViewChanging(false)
    }, 1000)
  }

  console.log("Rendering MapVisualization with:", {
    species: selectedSpecies.name,
    year: selectedYear,
    month: selectedMonth,
    is3DView,
  })

  // Create a formatted selection string for the alert
  const selectionString = `${selectedSpecies.name}${selectedYear ? ` - Year: ${selectedYear}` : ""}${selectedMonth && selectedMonth !== "all" ? ` - Month: ${selectedMonth}` : selectedMonth === "all" ? " - All Year" : ""}`

  return (
    <div className="flex-1 relative bg-migratewatch-dark">
      {/* Load Cesium from CDN (for 3D view) */}
      {is3DView && (
        <>
          <Script
            src="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Cesium.js"
            onLoad={() => setScriptLoaded(true)}
            onError={(e) => {
              console.error("Failed to load Cesium script:", e)
              setLoadError("Failed to load Cesium from CDN")
            }}
            strategy="afterInteractive"
          />
          <link
            rel="stylesheet"
            href="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Widgets/widgets.css"
          />
        </>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-50 flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan shadow-lg"
          onClick={toggleViewMode}
          title={is3DView ? "Switch to 2D Map" : "Switch to 3D Globe"}
          disabled={viewChanging}
        >
          {is3DView ? <MapIcon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan shadow-lg"
          onClick={forceRefresh}
          title="Force Refresh Map"
          disabled={viewChanging}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan shadow-lg"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 z-50 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan shadow-lg"
          title="Zoom In"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan shadow-lg"
          title="Zoom Out"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-migratewatch-panel/80 p-3 rounded-md">
        <div className="text-xs font-medium mb-2">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-migratewatch-cyan"></div>
            <span className="text-xs">Migration Points</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-migratewatch-orange"></div>
            <span className="text-xs">Shipping Lanes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-migratewatch-magenta opacity-60"></div>
            <span className="text-xs">Conflict Zones</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-migratewatch-green alternative-route"></div>
            <span className="text-xs">Alternative Routes</span>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 mt-2">
          {selectedSpecies.name} - {selectedMonth === "all" ? "All Year" : `Month ${selectedMonth}`} {selectedYear}
        </div>
      </div>

      {/* Loading Indicator */}
      {(viewChanging || isLoadingData) && (
        <div className="absolute inset-0 flex items-center justify-center bg-migratewatch-dark bg-opacity-80 z-20">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-migratewatch-cyan mb-3"></div>
            <div>{isLoadingData ? "Loading migration data..." : "Changing view mode..."}</div>
          </div>
        </div>
      )}

      {noDataFound && !isLoadingData && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 bg-migratewatch-panel/90 p-4 rounded-lg shadow-lg border border-migratewatch-magenta text-center">
          <div className="text-migratewatch-magenta text-lg font-bold mb-2">No Fish Found</div>
          <div className="text-white text-sm">
            No migration data available for:
            <br />
            <span className="font-medium">{selectionString}</span>
          </div>
          <Button
            className="mt-4 bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark"
            onClick={forceRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* 3D View (Cesium) */}
      <div ref={cesiumContainerRef} className={`h-full w-full ${!is3DView ? "hidden" : ""}`} />

      {/* 2D View (Leaflet or Fallback) */}
      {!is3DView && (
        <>
          {!map2DFailed ? (
            <MapView2D
              selectedSpecies={selectedSpecies}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              dataLayers={dataLayers}
              timelineData={timelineData}
              onError={() => {
                console.error("2D map failed to load, switching to fallback")
                setMap2DFailed(true)
              }}
            />
          ) : (
            <MapView2DFallback selectedSpecies={selectedSpecies} dataLayers={dataLayers} timelineData={timelineData} />
          )}
        </>
      )}
      {/* Floating View Toggle Button (backup) */}
      {!is3DView && (
        <div className="fixed bottom-20 right-4 z-50">
          <Button
            size="sm"
            className="bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark shadow-lg"
            onClick={() => setIs3DView(true)}
          >
            <Globe className="h-4 w-4 mr-1" />
            3D View
          </Button>
        </div>
      )}
    </div>
  )
}

