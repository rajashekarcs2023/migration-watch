"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { AnalysisPanels } from "@/components/analysis-panels"
import { Timeline } from "@/components/timeline"
import { MobileView } from "@/components/mobile-view"
import { MapVisualization } from "@/components/map-visualization"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"
import { useMediaQuery } from "@/hooks/use-mobile"

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesData>({
    id: "clupea-pallasii",
    name: "Clupea pallasii",
    selected: true,
  })

  // Initialize with empty values for year and month
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")

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

  const isMobile = useMediaQuery("(max-width: 768px)")

  // Force map re-render when species, year, month, or data layers change
  useEffect(() => {
    console.log("Selection changed, forcing map refresh")
    // Force a complete re-render of the map component
    setIs3DView(false) // First switch to 2D

    // Then after a short delay, switch back to 3D
    setTimeout(() => {
      setMapKey((prev) => prev + 1)
      setIs3DView(true)
    }, 100)
  }, [selectedSpecies, selectedYear, selectedMonth])

  // Add a separate effect for data layers to avoid toggling view unnecessarily
  useEffect(() => {
    console.log("Data layers changed, updating map")
    setMapKey((prev) => prev + 1)
  }, [dataLayers])

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
  }

  // Add this function to the Dashboard component
  const forceMapRefresh = () => {
    console.log("Forcing map refresh")
    // Force a complete re-render of the map
    setIs3DView(false)

    // After a short delay, switch back to 3D and increment the key
    setTimeout(() => {
      setMapKey((prev) => prev + 1)
      setIs3DView(true)
    }, 300)
  }

  // Desktop view
  const DesktopView = () => (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedSpecies={selectedSpecies}
          setSelectedSpecies={setSelectedSpecies}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          dataLayers={dataLayers}
          setDataLayers={setDataLayers}
          onSelectionChange={forceMapRefresh}
        />
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <MapVisualization
              key={mapKey}
              selectedSpecies={selectedSpecies}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              dataLayers={dataLayers}
              timelineData={timelineData}
              is3DView={is3DView}
              setIs3DView={handleViewModeToggle}
            />
            <AnalysisPanels
              selectedSpecies={selectedSpecies}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
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
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
      dataLayers={dataLayers}
      setDataLayers={setDataLayers}
      onSelectionChange={forceMapRefresh}
    >
      <div className="flex flex-col h-screen">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1">
          <MapVisualization
            key={mapKey}
            selectedSpecies={selectedSpecies}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
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

