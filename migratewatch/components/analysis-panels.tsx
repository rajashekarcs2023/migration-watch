"use client"

import { useState, useEffect, useCallback } from "react"
import type { SpeciesData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, BarChart3, Brain, AlertTriangle, Fish, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIAssistant } from "./ai-assistant"
import { useRouter } from "next/navigation"
import {
  generateConflictAnalysis,
  generateAIInsights,
  generateRouteOptimizations,
  generateAlerts,
} from "@/lib/analysis-api"

interface AnalysisPanelsProps {
  selectedSpecies: SpeciesData
  selectedYear: string
  selectedMonth: string
}

export function AnalysisPanels({ selectedSpecies, selectedYear, selectedMonth }: AnalysisPanelsProps) {
  const [activePanel, setActivePanel] = useState<string | null>("conflict")
  const [showAssistant, setShowAssistant] = useState(false)
  const [activeTab, setActiveTab] = useState<string | null>(null)

  // State for dynamic data
  const [conflictAnalysis, setConflictAnalysis] = useState<any>(null)
  const [aiInsights, setAIInsights] = useState<any>(null)
  const [routeOptimizations, setRouteOptimizations] = useState<any>(null)
  const [alerts, setAlerts] = useState<string[]>([])

  // Loading states
  const [loadingConflict, setLoadingConflict] = useState(false)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [loadingAlerts, setLoadingAlerts] = useState(false)

  // Add error states to the component
  const [conflictError, setConflictError] = useState<boolean>(false)
  const [insightsError, setInsightsError] = useState<boolean>(false)
  const [routesError, setRoutesError] = useState<boolean>(false)
  const [alertsError, setAlertsError] = useState<boolean>(false)

  const router = useRouter()

  // Format the time period for display
  const formatPeriod = () => {
    if (selectedMonth === "all") {
      return `All Year ${selectedYear}`
    } else if (selectedMonth && selectedYear) {
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const monthIndex = Number.parseInt(selectedMonth) - 1
      return `${monthNames[monthIndex]} ${selectedYear}`
    } else if (selectedYear) {
      return `${selectedYear}`
    } else {
      return "Current Period"
    }
  }

  // Fetch conflict analysis data when species, year, or month changes
  const fetchConflictAnalysis = useCallback(async () => {
    if (!selectedSpecies.name) return

    setLoadingConflict(true)
    setConflictError(false)
    try {
      const data = await generateConflictAnalysis(selectedSpecies.name, selectedYear, selectedMonth)
      setConflictAnalysis(data)
    } catch (error) {
      console.error("Error fetching conflict analysis:", error)
      setConflictError(true)
    } finally {
      setLoadingConflict(false)
    }
  }, [selectedSpecies.name, selectedYear, selectedMonth])

  useEffect(() => {
    fetchConflictAnalysis()
  }, [fetchConflictAnalysis])

  // Fetch AI insights when species, year, or month changes
  const fetchAIInsights = useCallback(async () => {
    if (!selectedSpecies.name) return

    setLoadingInsights(true)
    setInsightsError(false)
    try {
      const data = await generateAIInsights(selectedSpecies.name, selectedYear, selectedMonth)
      setAIInsights(data)
    } catch (error) {
      console.error("Error fetching AI insights:", error)
      setInsightsError(true)
    } finally {
      setLoadingInsights(false)
    }
  }, [selectedSpecies.name, selectedYear, selectedMonth])

  useEffect(() => {
    fetchAIInsights()
  }, [fetchAIInsights])

  // Fetch route optimizations when species, year, or month changes
  const fetchRouteOptimizations = useCallback(async () => {
    if (!selectedSpecies.name) return

    setLoadingRoutes(true)
    setRoutesError(false)
    try {
      const data = await generateRouteOptimizations(selectedSpecies.name, selectedYear, selectedMonth)
      setRouteOptimizations(data)
    } catch (error) {
      console.error("Error fetching route optimizations:", error)
      setRoutesError(true)
    } finally {
      setLoadingRoutes(false)
    }
  }, [selectedSpecies.name, selectedYear, selectedMonth])

  useEffect(() => {
    fetchRouteOptimizations()
  }, [fetchRouteOptimizations])

  // Fetch alerts when species, year, or month changes
  const fetchAlerts = useCallback(async () => {
    if (!selectedSpecies.name) return

    setLoadingAlerts(true)
    setAlertsError(false)
    try {
      const data = await generateAlerts(selectedSpecies.name, selectedYear, selectedMonth)
      setAlerts(data)
    } catch (error) {
      console.error("Error fetching alerts:", error)
      setAlertsError(true)
    } finally {
      setLoadingAlerts(false)
    }
  }, [selectedSpecies.name, selectedYear, selectedMonth])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  // Toggle panel expansion
  const togglePanel = (panel: string) => {
    if (activePanel === panel) {
      setActivePanel(null)
    } else {
      setActivePanel(panel)
    }
  }

  // Toggle between analysis panels and AI assistant
  const toggleAssistant = () => {
    setShowAssistant(!showAssistant)
  }

  // Add a function to handle the species info button click
  const handleSpeciesInfoClick = () => {
    // Navigate to the species info page with the selected species as a query parameter
    router.push(`/species-info?name=${encodeURIComponent(selectedSpecies.name)}`)
  }

  // Add a retry function for each panel
  const retryConflictAnalysis = () => {
    fetchConflictAnalysis()
  }

  const retryAIInsights = () => {
    fetchAIInsights()
  }

  const retryRouteOptimizations = () => {
    fetchRouteOptimizations()
  }

  const retryAlerts = () => {
    fetchAlerts()
  }

  // If assistant is active, show the assistant component
  if (showAssistant) {
    return <AIAssistant onClose={toggleAssistant} />
  }

  return (
    <div className="w-80 bg-migratewatch-darker p-4 overflow-y-auto border-l border-migratewatch-panel">
      {/* AI Assistant Button */}
      <div className="mb-4">
        <Button
          className="w-full bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark flex items-center justify-center"
          onClick={toggleAssistant}
        >
          <Fish className="mr-2 h-4 w-4" />
          OceanPulse Assistant
        </Button>
      </div>

      <div className="space-y-4">
        {/* Conflict Analysis Panel */}
        <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none overflow-hidden">
          <CardHeader
            className="pb-2 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => togglePanel("conflict")}
          >
            <CardTitle className="text-base text-white flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-migratewatch-cyan" />
              <span className="relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-migratewatch-cyan">
                Conflict Analysis
              </span>
            </CardTitle>
            {activePanel === "conflict" ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <div
            className={cn(
              "transition-all duration-300 ease-in-out",
              activePanel === "conflict" ? "max-h-96" : "max-h-0",
            )}
          >
            <CardContent className="text-sm space-y-2">
              {loadingConflict ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 text-migratewatch-cyan animate-spin" />
                </div>
              ) : conflictAnalysis ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Species:</span>
                    <span>{conflictAnalysis.species}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Period:</span>
                    <span>{formatPeriod()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">High-risk areas detected:</span>
                    <span className="text-migratewatch-magenta font-medium">{conflictAnalysis.highRiskAreas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Collision risk reduction potential:</span>
                    <span className="text-migratewatch-cyan font-medium">
                      {conflictAnalysis.collisionRiskReduction}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg. shipping route deviation:</span>
                    <span>{conflictAnalysis.avgRouteDeviation} nautical miles</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Recommended action:</span>
                    <span className="text-migratewatch-green">{conflictAnalysis.recommendedAction}</span>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 italic">No analysis data available</div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* AI Insights Panel */}
        <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none overflow-hidden">
          <CardHeader
            className="pb-2 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => togglePanel("ai")}
          >
            <CardTitle className="text-base text-white flex items-center">
              <Brain className="h-4 w-4 mr-2 text-migratewatch-cyan" />
              <span className="relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-migratewatch-cyan">
                AI Insights
              </span>
            </CardTitle>
            {activePanel === "ai" ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <div className={cn("transition-all duration-300 ease-in-out", activePanel === "ai" ? "max-h-96" : "max-h-0")}>
            <CardContent>
              {loadingInsights ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 text-migratewatch-cyan animate-spin" />
                </div>
              ) : insightsError ? (
                <div className="flex flex-col items-center py-2">
                  <div className="text-migratewatch-magenta text-xs italic mb-2">
                    Error loading insights. Using cached data.
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-migratewatch-cyan text-migratewatch-cyan hover:bg-migratewatch-cyan/20"
                    onClick={retryAIInsights}
                  >
                    Retry
                  </Button>
                </div>
              ) : aiInsights ? (
                <>
                  <p className="text-sm italic text-gray-300">"{aiInsights.insight}"</p>
                  <div className="mt-4 text-xs text-gray-400">
                    <div className="flex justify-between mb-1">
                      <span>Confidence:</span>
                      <span>{aiInsights.confidence}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Data sources:</span>
                      <span>{aiInsights.dataSources}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last updated:</span>
                      <span>{aiInsights.lastUpdated}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 italic">No insights available</div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Route Optimization Panel */}
        <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none overflow-hidden">
          <CardHeader
            className="pb-2 cursor-pointer flex flex-row items-center justify-between"
            onClick={() => togglePanel("route")}
          >
            <CardTitle className="text-base text-white flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-migratewatch-cyan" />
              <span className="relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-migratewatch-cyan">
                Route Optimizations
              </span>
            </CardTitle>
            {activePanel === "route" ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </CardHeader>
          <div
            className={cn("transition-all duration-300 ease-in-out", activePanel === "route" ? "max-h-96" : "max-h-0")}
          >
            <CardContent>
              {loadingRoutes ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-5 w-5 text-migratewatch-cyan animate-spin" />
                </div>
              ) : routeOptimizations ? (
                <>
                  <div className="h-40">
                    <RouteOptimizationChart data={routeOptimizations.routes} />
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>{routeOptimizations.summary}</p>
                  </div>
                </>
              ) : (
                <div className="text-gray-400 italic">No route optimization data available</div>
              )}
            </CardContent>
          </div>
        </Card>

        {/* Alerts Panel */}
        <AlertsPanel alerts={alerts} loading={loadingAlerts} />

        {/* Species Information Button */}
        <Button
          className="w-full mt-4 bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark flex items-center justify-center"
          onClick={handleSpeciesInfoClick}
        >
          <Fish className="mr-2 h-4 w-4" />
          Species Information
        </Button>
      </div>
    </div>
  )
}

function RouteOptimizationChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-400 italic">No route data available</div>
  }

  const maxRisk = Math.max(...data.map((d) => d.risk))

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>Collision Risk</span>
        <span>Percentage</span>
      </div>
      <div className="flex-1 flex items-end space-x-3">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col items-center flex-1">
            <div className="w-full flex flex-col items-center">
              <div className="text-xs mb-1">{item.risk}%</div>
              <div
                className="w-full rounded-sm transition-all duration-500 ease-out"
                style={{
                  height: `${(item.risk / maxRisk) * 100}%`,
                  backgroundColor: item.color,
                  minHeight: "4px",
                }}
              />
            </div>
            <div className="text-xs mt-1">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertsPanel({ alerts, loading }: { alerts: string[]; loading: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none overflow-hidden">
      <CardHeader
        className="pb-2 cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-base text-white flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-migratewatch-magenta" />
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-migratewatch-cyan">
            Alerts
          </span>
        </CardTitle>
        <span className="flex items-center">
          <span className="text-migratewatch-magenta mr-2">{alerts.length}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </span>
      </CardHeader>
      <div className={cn("transition-all duration-300 ease-in-out", isExpanded ? "max-h-60" : "max-h-0")}>
        <CardContent className="text-sm">
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-5 w-5 text-migratewatch-cyan animate-spin" />
            </div>
          ) : alerts && alerts.length > 0 ? (
            <ul className="space-y-2">
              {alerts.map((alert, index) => (
                <li key={index} className="text-xs flex items-start space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-migratewatch-magenta mt-1 flex-shrink-0" />
                  <span>{alert}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400 italic">No alerts at this time</div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

