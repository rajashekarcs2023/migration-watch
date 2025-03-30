"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { SpeciesData } from "@/lib/types"

interface MapInfoCardProps {
  title: string
  species: SpeciesData
  position: { x: number; y: number } | null
  onClose: () => void
  data: {
    riskLevel: string
    riskPercentage: number
    vesselCount: number
    recommendedAction: string
    alternativeRoute: {
      distance: string
      riskReduction: string
      timeImpact: string
    }
  }
}

export function MapInfoCard({ title, species, position, onClose, data }: MapInfoCardProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  if (!position) return null

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const cardStyle = {
    left: `${position.x}px`,
    top: `${position.y}px`,
    maxWidth: "300px",
    zIndex: 1000,
  }

  return (
    <div
      className="absolute bg-migratewatch-panel/95 rounded-lg shadow-lg border border-migratewatch-cyan/30 overflow-hidden transition-all duration-300"
      style={cardStyle}
    >
      <div className="flex items-center justify-between p-3 bg-migratewatch-darker border-b border-migratewatch-panel">
        <h3 className="text-sm font-bold text-white flex items-center">
          <div className="w-2 h-2 rounded-full bg-migratewatch-cyan mr-2 animate-pulse"></div>
          {title}
        </h3>
        <div className="flex items-center space-x-1">
          <button onClick={toggleMinimize} className="text-gray-400 hover:text-white transition-colors">
            {isMinimized ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="7 13 12 18 17 13"></polyline>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="7 11 12 6 17 11"></polyline>
              </svg>
            )}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3 text-xs space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Species:</span>
            <span>{species.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Risk Level:</span>
            <span
              className={`font-medium ${data.riskLevel === "High" ? "text-migratewatch-magenta" : "text-migratewatch-orange"}`}
            >
              {data.riskLevel} ({data.riskPercentage}%)
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Vessel Traffic:</span>
            <span>{data.vesselCount} vessels/month</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Recommended Action:</span>
            <span className="text-migratewatch-green">{data.recommendedAction}</span>
          </div>

          <div className="mt-2 pt-2 border-t border-migratewatch-panel">
            <div className="font-medium mb-1 text-migratewatch-cyan">Alternative Route Impact:</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div className="text-gray-400">Distance:</div>
              <div>{data.alternativeRoute.distance}</div>
              <div className="text-gray-400">Risk Reduction:</div>
              <div className="text-migratewatch-green">{data.alternativeRoute.riskReduction}</div>
              <div className="text-gray-400">Time Impact:</div>
              <div>{data.alternativeRoute.timeImpact}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

