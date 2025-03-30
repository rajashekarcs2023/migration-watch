"use client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import type { SpeciesData, DataLayers } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

// Update the SidebarProps interface to include the onSelectionChange callback
interface SidebarProps {
  selectedSpecies: SpeciesData
  setSelectedSpecies: (species: SpeciesData) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  dataLayers: DataLayers
  setDataLayers: (layers: DataLayers) => void
  onSelectionChange?: () => void
}

// Update the function parameters to include onSelectionChange
export function Sidebar({
  selectedSpecies,
  setSelectedSpecies,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  dataLayers,
  setDataLayers,
  onSelectionChange,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSpecies, setFilteredSpecies] = useState<{ id: string; name: string }[]>([])

  // List of 18 fish species provided by the user
  const allSpecies = [
    { id: "gadus-morhua", name: "Gadus morhua" },
    { id: "clupea-pallasii", name: "Clupea pallasii" },
    { id: "genypterus-blacodes", name: "Genypterus blacodes" },
    { id: "squalus-acanthias", name: "Squalus acanthias" },
    { id: "deania-calceus", name: "Deania calceus" },
    { id: "balaenoptera-physalus", name: "Balaenoptera physalus" },
    { id: "centroselachus-crepidater", name: "Centroselachus crepidater" },
    { id: "diastobranchus-capensis", name: "Diastobranchus capensis" },
    { id: "galeorhinus-galeus", name: "Galeorhinus galeus" },
    { id: "eubalaena-glacialis", name: "Eubalaena glacialis" },
    { id: "centroscymnus-owstonii", name: "Centroscymnus owstonii" },
    { id: "hyperoodon-ampullatus", name: "Hyperoodon ampullatus" },
    { id: "kurtiella-bidentata", name: "Kurtiella bidentata" },
    { id: "thunnus-thynnus", name: "Thunnus thynnus" },
    { id: "hippoglossus-hippoglossus", name: "Hippoglossus hippoglossus" },
    { id: "merluccius-bilinearis", name: "Merluccius bilinearis" },
    { id: "pollachius-virens", name: "Pollachius virens" },
    { id: "urophycis-tenuis", name: "Urophycis tenuis" },
  ]

  // Years for selection (typically would be dynamic based on available data)
  const years = [
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
    "2012",
    "2011",
    "2010",
    "2009",
    "2008",
    "2007",
    "2006",
    "2005",
    "2004",
    "2003",
    "2002",
    "2001",
    "2000",
    "1999",
    "1998",
    "1997",
    "1996",
    "1995",
  ]

  // Months for selection
  const months = [
    { value: "all", label: "All Year" },
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  // Filter species based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSpecies(allSpecies)
    } else {
      const filtered = allSpecies.filter((species) => species.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredSpecies(filtered)
    }
  }, [searchTerm])

  // Initialize with all species and select the default one
  useEffect(() => {
    setFilteredSpecies(allSpecies)

    // Make sure the selected species is highlighted in the UI
    const speciesExists = allSpecies.some((species) => species.id === selectedSpecies.id)
    if (!speciesExists && allSpecies.length > 0) {
      // If the current selected species doesn't exist in the list, select the first one
      handleSpeciesSelect(allSpecies[0].id, allSpecies[0].name)
    }
  }, [])

  // Update the handlers to call onSelectionChange
  const handleSpeciesSelect = (id: string, name: string) => {
    console.log(`Selected species: ${name}`)
    // Force reset year and month when species changes to ensure clean state
    setSelectedYear("")
    setSelectedMonth("")
    setSelectedSpecies({ id, name, selected: true })
    if (onSelectionChange) {
      setTimeout(onSelectionChange, 100)
    }
  }

  const handleYearChange = (year: string) => {
    console.log(`Selected year: ${year}`)
    // Reset month when year changes
    setSelectedMonth("")
    setSelectedYear(year)
    if (onSelectionChange) {
      setTimeout(onSelectionChange, 100)
    }
  }

  const handleMonthChange = (month: string) => {
    console.log(`Selected month: ${month}`)
    setSelectedMonth(month)
    if (onSelectionChange) {
      setTimeout(onSelectionChange, 100)
    }
  }

  const toggleDataLayer = (layer: keyof DataLayers) => {
    setDataLayers({
      ...dataLayers,
      [layer]: !dataLayers[layer],
    })
  }

  return (
    <div className="w-64 bg-migratewatch-darker border-r border-migratewatch-panel overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-white">Species</h2>

          {/* Search input */}
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Search species..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-migratewatch-panel border-migratewatch-panel pl-8 text-sm"
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Species list */}
          <div className="max-h-48 overflow-y-auto space-y-1 bg-migratewatch-panel/50 rounded-md p-1">
            {filteredSpecies.length > 0 ? (
              filteredSpecies.map((species) => (
                <div
                  key={species.id}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors",
                    selectedSpecies.id === species.id ? "bg-migratewatch-panel" : "hover:bg-migratewatch-panel/80",
                  )}
                  onClick={() => handleSpeciesSelect(species.id, species.name)}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2",
                      selectedSpecies.id === species.id
                        ? "bg-migratewatch-cyan border-migratewatch-cyan"
                        : "border-gray-400",
                    )}
                  />
                  <span className="text-sm truncate">{species.name}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-400 p-2">No species found</div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-white">Time Period</h2>

          {/* Year selection */}
          <div className="mb-3">
            <Label htmlFor="year-select" className="text-sm mb-1 block">
              Year
            </Label>
            <Select value={selectedYear} onValueChange={handleYearChange}>
              <SelectTrigger id="year-select" className="bg-migratewatch-panel border-migratewatch-panel">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent className="bg-migratewatch-panel border-migratewatch-panel">
                {years.map((year) => (
                  <SelectItem key={year} value={year} className="focus:bg-migratewatch-cyan/20 focus:text-white">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month selection - only enabled if year is selected */}
          <div>
            <Label htmlFor="month-select" className="text-sm mb-1 block">
              Month
            </Label>
            <Select
              value={selectedMonth}
              onValueChange={handleMonthChange}
              disabled={!selectedYear} // Disable if no year selected
            >
              <SelectTrigger
                id="month-select"
                className={cn(
                  "bg-migratewatch-panel border-migratewatch-panel",
                  !selectedYear && "opacity-50 cursor-not-allowed",
                )}
              >
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent className="bg-migratewatch-panel border-migratewatch-panel">
                {months.map((month) => (
                  <SelectItem
                    key={month.value}
                    value={month.value}
                    className="focus:bg-migratewatch-cyan/20 focus:text-white"
                  >
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedYear && <p className="text-xs text-gray-400 mt-1">Select a year first</p>}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-white">Data Layers</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="migration-routes" className="text-sm">
                Migration Routes
              </Label>
              <Switch
                id="migration-routes"
                checked={dataLayers.migrationRoutes}
                onCheckedChange={() => toggleDataLayer("migrationRoutes")}
                className="data-[state=checked]:bg-migratewatch-cyan"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shipping-lanes" className="text-sm">
                Shipping Lanes
              </Label>
              <Switch
                id="shipping-lanes"
                checked={dataLayers.shippingLanes}
                onCheckedChange={() => toggleDataLayer("shippingLanes")}
                className="data-[state=checked]:bg-migratewatch-cyan"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="conflict-zones" className="text-sm">
                Conflict Zones
              </Label>
              <Switch
                id="conflict-zones"
                checked={dataLayers.conflictZones}
                onCheckedChange={() => toggleDataLayer("conflictZones")}
                className="data-[state=checked]:bg-migratewatch-cyan"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sea-temperature" className="text-sm">
                Sea Temperature
              </Label>
              <Switch
                id="sea-temperature"
                checked={dataLayers.seaTemperature}
                onCheckedChange={() => toggleDataLayer("seaTemperature")}
                className="data-[state=checked]:bg-migratewatch-cyan"
              />
            </div>
          </div>
        </div>

        <Button className="w-full bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark">
          Generate Report
        </Button>
      </div>
    </div>
  )
}

