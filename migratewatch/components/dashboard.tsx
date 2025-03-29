"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { AnalysisPanels } from "@/components/analysis-panels"
import { Timeline } from "@/components/timeline"
import { MobileView } from "@/components/mobile-view"
import { MapVisualization } from "@/components/map-visualization"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"
import { useMobile } from "@/hooks/use-mobile"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesData>({
    id: "narw",
    name: "North Atlantic Right Whale",
    selected: true,
  })

  const [selectedMonths, setSelectedMonths] = useState<string[]>(["Jan", "Feb", "Mar", "Nov", "Dec"])

  const [dataLayers, setDataLayers] = useState<DataLayers>({
    migrationRoutes: true,
    shippingLanes: true,
    conflictZones: true,
    seaTemperature: false,
  })

  const [timelineData, setTimelineData] = useState<TimelineData>({
    currentPeriod: "January - March 2023",
    position: 30,
  })

  const [is3DView, setIs3DView] = useState(true)
  const [mapKey, setMapKey] = useState(0) // Used to force re-render of the map when data changes

  const isMobile = useMobile(768)

  // Force map re-render when species or data layers change
  useEffect(() => {
    setMapKey((prev) => prev + 1)
  }, [selectedSpecies, dataLayers])

  // Update data layers based on active tab
  useEffect(() => {
    if (activeTab === "Migrations") {
      setDataLayers({
        ...dataLayers,
        migrationRoutes: true,
        shippingLanes: false,
        conflictZones: false,
      })
    } else if (activeTab === "Shipping Data") {
      setDataLayers({
        ...dataLayers,
        migrationRoutes: false,
        shippingLanes: true,
        conflictZones: false,
      })
    } else if (activeTab === "Conflict Zones") {
      setDataLayers({
        ...dataLayers,
        migrationRoutes: true,
        shippingLanes: true,
        conflictZones: true,
      })
    }
  }, [activeTab])

  // Handle 3D/2D toggle
  const handleViewModeToggle = (is3D: boolean) => {
    console.log(`Setting view mode to: ${is3D ? "3D" : "2D"}`)
    setIs3DView(is3D)
    // We don't need to force a re-render with the key anymore
    // since we're directly modifying the scene
  }

  // Desktop view
  const DesktopView = () => (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
          selectedMonths={selectedMonths}
          setSelectedMonths={setSelectedMonths}
          dataLayers={dataLayers}
          setDataLayers={setDataLayers}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <MapVisualization
              key={mapKey}
              selectedSpecies={selectedSpecies}
              dataLayers={dataLayers}
              timelineData={timelineData}
              is3DView={is3DView}
              setIs3DView={handleViewModeToggle}
            />
            <AnalysisPanels selectedSpecies={selectedSpecies} selectedMonths={selectedMonths} />
          </div>
          <Timeline timelineData={timelineData} setTimelineData={setTimelineData} />
        </div>
      </div>
    </div>
  )

  // Render based on screen size
  return isMobile ? (
    <MobileView
      selectedSpecies={selectedSpecies}
      setSelectedSpecies={setSelectedSpecies}
      selectedMonths={selectedMonths}
      setSelectedMonths={setSelectedMonths}
      dataLayers={dataLayers}
      setDataLayers={setDataLayers}
    >
      <div className="flex flex-col h-screen">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <MapVisualization
            key={mapKey}
            selectedSpecies={selectedSpecies}
            dataLayers={dataLayers}
            timelineData={timelineData}
            is3DView={is3DView}
            setIs3DView={handleViewModeToggle}
          />
        </div>
        <Timeline timelineData={timelineData} setTimelineData={setTimelineData} />
      </div>
    </MobileView>
  ) : (
    <DesktopView />
  )
}
