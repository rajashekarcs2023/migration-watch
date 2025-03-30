"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, Menu, X } from "lucide-react"
import { Sidebar } from "./sidebar"
import { AnalysisPanels } from "./analysis-panels"
import type { SpeciesData, DataLayers } from "@/lib/types"

interface MobileViewProps {
  selectedSpecies: SpeciesData
  setSelectedSpecies: (species: SpeciesData) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  dataLayers: DataLayers
  setDataLayers: (layers: DataLayers) => void
  children: React.ReactNode
  onSelectionChange?: () => void
}

export function MobileView({
  selectedSpecies,
  setSelectedSpecies,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  dataLayers,
  setDataLayers,
  children,
  onSelectionChange,
}: MobileViewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)

  return (
    <div className="relative h-screen overflow-hidden md:hidden">
      {/* Main content */}
      <div className="h-full">{children}</div>

      {/* Mobile menu buttons */}
      <div className="absolute top-4 left-4 z-20">
        <Button
          variant="outline"
          size="icon"
          className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Analysis panel toggle */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-migratewatch-darker border-t border-migratewatch-panel transition-transform duration-300 ${
          analysisOpen ? "translate-y-0" : "translate-y-[calc(100%-40px)]"
        }`}
        style={{ maxHeight: "calc(70vh)" }}
      >
        <div
          className="h-10 flex items-center justify-center cursor-pointer"
          onClick={() => setAnalysisOpen(!analysisOpen)}
        >
          <ChevronUp
            className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${analysisOpen ? "rotate-180" : ""}`}
          />
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 40px)" }}>
          <AnalysisPanels selectedSpecies={selectedSpecies} selectedYear={selectedYear} selectedMonth={selectedMonth} />
        </div>
      </div>

      {/* Sidebar drawer */}
      <Sidebar
        selectedSpecies={selectedSpecies}
        setSelectedSpecies={setSelectedSpecies}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        dataLayers={dataLayers}
        setDataLayers={setDataLayers}
        onSelectionChange={onSelectionChange}
      />

      {/* Backdrop */}
      {sidebarOpen && <div className="absolute inset-0 bg-black/50 z-20" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

