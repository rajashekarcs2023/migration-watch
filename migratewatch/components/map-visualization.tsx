"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"
import { Maximize, Minimize, Globe, MapIcon, ZoomIn, ZoomOut } from "lucide-react"
import Script from "next/script"
import { MapView2D } from "./map-view-2d"
import { MapView2DFallback } from "./map-view-2d-fallback"

// Declare Cesium as a global variable
declare global {
  interface Window {
    Cesium: any
  }
}

interface MapVisualizationProps {
  selectedSpecies: SpeciesData
  dataLayers: DataLayers
  timelineData: TimelineData
  is3DView: boolean
  setIs3DView: (is3D: boolean) => void
}

export function MapVisualization({
  selectedSpecies,
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

  // Initialize Cesium after script is loaded (for 3D view)
  useEffect(() => {
    if (!is3DView || !scriptLoaded || !cesiumContainerRef.current) return

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
          destination: Cesium.Cartesian3.fromDegrees(-70.0, 40.0, 3000000),
          complete: () => {
            try {
              // Add basic data to the map
              if (dataLayers.migrationRoutes) {
                addMigrationRoutes(Cesium, viewer)
              }

              if (dataLayers.shippingLanes) {
                addShippingLanes(Cesium, viewer)
              }

              if (dataLayers.conflictZones) {
                addConflictZones(Cesium, viewer)
              }

              setCesiumLoaded(true)
              setViewChanging(false)

              // Start animation for migration routes
              if (dataLayers.migrationRoutes) {
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
          if (dataLayers.migrationRoutes) {
            addMigrationRoutes(Cesium, viewer)
          }

          if (dataLayers.shippingLanes) {
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
  }, [scriptLoaded, is3DView, dataLayers])

  // Add migration routes
  function addMigrationRoutes(Cesium: any, viewer: any) {
    try {
      // North Atlantic Right Whale route
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            -67.0, 44.0, -70.0, 42.5, -71.0, 41.0, -74.0, 39.0, -75.5, 35.0, -80.0, 32.0, -81.5, 30.5,
          ]),
          width: 3,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: Cesium.Color.CYAN,
          }),
        },
      })
    } catch (error) {
      console.error("Error adding migration routes:", error)
    }
  }

  // Add animated migration points
  function startMigrationAnimation(Cesium: any, viewer: any) {
    if (!viewer || viewer.isDestroyed()) return

    // Cancel any existing animation
    if (animationFrameIdRef.current !== null) {
      cancelAnimationFrame(animationFrameIdRef.current)
      animationFrameIdRef.current = null
    }

    const positions = [
      [-67.0, 44.0],
      [-70.0, 42.5],
      [-71.0, 41.0],
      [-74.0, 39.0],
      [-75.5, 35.0],
      [-80.0, 32.0],
      [-81.5, 30.5],
    ]

    const entities: any[] = []

    try {
      // Create 5 entities at different positions along the path
      for (let i = 0; i < 5; i++) {
        const entity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(positions[0][0], positions[0][1]),
          point: {
            pixelSize: 8,
            color: Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
          },
        })
        entities.push({
          entity,
          progress: i * 0.2, // Spread entities along the path
          speed: 0.0005,
        })
      }

      // Animation function
      const animate = () => {
        if (!viewer.isDestroyed()) {
          try {
            entities.forEach((item) => {
              item.progress += item.speed
              if (item.progress > 1) {
                item.progress = 0
              }

              // Find position on the path
              const pathLength = positions.length - 1
              const segmentIndex = Math.floor(item.progress * pathLength)
              const segmentProgress = (item.progress * pathLength) % 1

              const start = positions[segmentIndex]
              const end = positions[Math.min(segmentIndex + 1, positions.length - 1)]

              const lng = start[0] + (end[0] - start[0]) * segmentProgress
              const lat = start[1] + (end[1] - start[1]) * segmentProgress

              item.entity.position = Cesium.Cartesian3.fromDegrees(lng, lat)
            })

            animationFrameIdRef.current = requestAnimationFrame(animate)
          } catch (error) {
            console.error("Error in animation loop:", error)
            // Don't continue the animation if there's an error
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
      viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            -74.0, 40.7, -60.0, 42.0, -40.0, 45.0, -20.0, 48.0, -5.0, 50.0, 0.0, 51.5,
          ]),
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.ORANGE,
          }),
        },
      })
    } catch (error) {
      console.error("Error adding shipping lanes:", error)
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
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan"
          onClick={toggleViewMode}
          title={is3DView ? "Switch to 2D Map" : "Switch to 3D Globe"}
          disabled={viewChanging}
        >
          {is3DView ? <MapIcon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-20 right-4 z-10 flex flex-col space-y-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan"
          title="Zoom In"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan"
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
            <div className="w-4 h-0.5 bg-migratewatch-cyan migration-path"></div>
            <span className="text-xs">Migration Routes</span>
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
        <div className="text-[10px] text-gray-400 mt-2">Demo Data</div>
      </div>

      {/* Loading Indicator */}
      {viewChanging && (
        <div className="absolute inset-0 flex items-center justify-center bg-migratewatch-dark bg-opacity-80 z-20">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-migratewatch-cyan mb-3"></div>
            <div>Changing view mode...</div>
          </div>
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
    </div>
  )
}

