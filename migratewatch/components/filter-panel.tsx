"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sliders, Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FilterPanelProps {
  onFilterChange: (filters: any) => void
  className?: string
}

export function FilterPanel({ onFilterChange, className }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState({
    vesselTypes: {
      cargo: true,
      tanker: true,
      passenger: true,
      fishing: false,
    },
    riskLevels: {
      high: true,
      medium: true,
      low: false,
    },
    timeRange: [0, 100],
  })

  const toggleFilter = () => {
    setIsOpen(!isOpen)
  }

  const handleVesselTypeChange = (type: string) => {
    const newFilters = {
      ...filters,
      vesselTypes: {
        ...filters.vesselTypes,
        [type]: !filters.vesselTypes[type as keyof typeof filters.vesselTypes],
      },
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRiskLevelChange = (level: string) => {
    const newFilters = {
      ...filters,
      riskLevels: {
        ...filters.riskLevels,
        [level]: !filters.riskLevels[level as keyof typeof filters.riskLevels],
      },
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    const newFilters = {
      ...filters,
      timeRange: [0, value],
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className={cn("absolute top-4 left-4 z-10", className)}>
      <Button
        variant="outline"
        size="icon"
        className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan"
        onClick={toggleFilter}
        title="Map Filters"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
      </Button>

      {isOpen && (
        <div className="absolute top-12 left-0 bg-migratewatch-panel/95 border border-migratewatch-panel rounded-lg shadow-lg p-4 w-64 text-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center">
              <Sliders className="h-3.5 w-3.5 mr-2 text-migratewatch-cyan" />
              Map Filters
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Vessel Types</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(filters.vesselTypes).map(([type, checked]) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleVesselTypeChange(type)}
                      className="accent-migratewatch-cyan"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Risk Levels</h4>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(filters.riskLevels).map(([level, checked]) => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleRiskLevelChange(level)}
                      className="accent-migratewatch-cyan"
                    />
                    <span
                      className={cn(
                        "capitalize",
                        level === "high"
                          ? "text-migratewatch-magenta"
                          : level === "medium"
                            ? "text-migratewatch-orange"
                            : "text-migratewatch-green",
                      )}
                    >
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Time Range (months)</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.timeRange[1]}
                onChange={handleTimeRangeChange}
                className="w-full h-2 bg-migratewatch-darker rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                <span>Jan</span>
                <span>Jun</span>
                <span>Dec</span>
              </div>
            </div>

            <Button
              className="w-full bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark text-xs h-8"
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

