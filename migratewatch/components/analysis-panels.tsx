"use client"

import { useState } from "react"
import type { SpeciesData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp, BarChart3, Brain, AlertTriangle, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIAssistant } from "./ai-assistant"

interface AnalysisPanelsProps {
  selectedSpecies: SpeciesData
  selectedMonths: string[]
}

export function AnalysisPanels({ selectedSpecies, selectedMonths }: AnalysisPanelsProps) {
  const [activePanel, setActivePanel] = useState<string | null>("conflict")
  const [showAssistant, setShowAssistant] = useState(false)

  // Format the selected months for display
  const formatPeriod = () => {
    if (
      selectedMonths.includes("Jan") &&
      selectedMonths.includes("Feb") &&
      selectedMonths.includes("Mar") &&
      selectedMonths.includes("Nov") &&
      selectedMonths.includes("Dec")
    ) {
      return "Winter Migration (Jan-Mar, Nov-Dec)"
    }
    return selectedMonths.join(", ")
  }

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
          <Bot className="mr-2 h-4 w-4" />
          Open AI Assistant
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
              <div className="flex justify-between">
                <span className="text-gray-400">Species:</span>
                <span>{selectedSpecies.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Period:</span>
                <span>{formatPeriod()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">High-risk areas detected:</span>
                <span className="text-migratewatch-magenta font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Collision risk reduction potential:</span>
                <span className="text-migratewatch-cyan font-medium">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg. shipping route deviation:</span>
                <span>12.3 nautical miles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recommended action:</span>
                <span className="text-migratewatch-green">Seasonal speed restriction</span>
              </div>
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
              <p className="text-sm italic text-gray-300">
                "Current migration pattern shows higher concentration in the mid-Atlantic than previous years. Recommend
                shifting southern shipping lanes 8nm north to reduce collision risk by 65%."
              </p>
              <div className="mt-4 text-xs text-gray-400">
                <div className="flex justify-between mb-1">
                  <span>Confidence:</span>
                  <span>92%</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Data sources:</span>
                  <span>NOAA, AIS, Satellite</span>
                </div>
                <div className="flex justify-between">
                  <span>Last updated:</span>
                  <span>March 29, 2025</span>
                </div>
              </div>
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
              <div className="h-40">
                <RouteOptimizationChart />
              </div>
              <div className="mt-2 text-xs text-gray-400">
                <p>
                  Shifting Boston shipping lane 8nm north reduces collision risk by 65% with minimal impact on shipping
                  efficiency.
                </p>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Alerts Panel */}
        <AlertsPanel />
      </div>
    </div>
  )
}

function RouteOptimizationChart() {
  const data = [
    { name: "Current", risk: 100, color: "#f72585" },
    { name: "Option 1", risk: 35, color: "#4cc9f0" },
    { name: "Option 2", risk: 22, color: "#4cc9f0" },
    { name: "Option 3", risk: 15, color: "#4cc9f0" },
  ]

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

function AlertsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)

  const alerts = [
    "Critical conflict detected: High concentration of right whales intersecting with Boston shipping lane",
    "Unusual migration pattern detected in sector C4",
    "5 vessels entering protected migration corridor",
  ]

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
      <div className={cn("transition-all duration-300 ease-in-out", isExpanded ? "max-h-40" : "max-h-0")}>
        <CardContent className="text-sm">
          <ul className="space-y-2">
            {alerts.map((alert, index) => (
              <li key={index} className="text-xs flex items-start space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-migratewatch-magenta mt-1 flex-shrink-0" />
                <span>{alert}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
    </Card>
  )
}

