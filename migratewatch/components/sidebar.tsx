"use client"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { SpeciesData, DataLayers } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarProps {
  selectedSpecies: SpeciesData
  setSelectedSpecies: (species: SpeciesData) => void
  selectedMonths: string[]
  setSelectedMonths: (months: string[]) => void
  dataLayers: DataLayers
  setDataLayers: (layers: DataLayers) => void
}

export function Sidebar({
  selectedSpecies,
  setSelectedSpecies,
  selectedMonths,
  setSelectedMonths,
  dataLayers,
  setDataLayers,
}: SidebarProps) {
  const species = [
    { id: "narw", name: "North Atlantic Right Whale" },
    { id: "humpback", name: "Humpback Whale" },
    { id: "blue", name: "Blue Whale" },
    { id: "loggerhead", name: "Loggerhead Sea Turtle" },
  ]

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const handleSpeciesSelect = (id: string, name: string) => {
    setSelectedSpecies({ id, name, selected: true })
  }

  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter((m) => m !== month))
    } else {
      setSelectedMonths([...selectedMonths, month])
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
          <div className="space-y-2">
            {species.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors",
                  selectedSpecies.id === s.id ? "bg-migratewatch-panel" : "hover:bg-migratewatch-panel/50",
                )}
                onClick={() => handleSpeciesSelect(s.id, s.name)}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2",
                    selectedSpecies.id === s.id ? "bg-migratewatch-cyan border-migratewatch-cyan" : "border-gray-400",
                  )}
                />
                <span className="text-sm">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-white">Time Period</h2>
          <div className="mb-2 text-sm text-gray-400">2023</div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month) => (
              <div
                key={month}
                className={cn(
                  "flex items-center justify-center p-2 rounded-md cursor-pointer text-xs transition-colors",
                  selectedMonths.includes(month)
                    ? "bg-migratewatch-cyan text-migratewatch-dark font-medium"
                    : "bg-migratewatch-panel text-gray-300 hover:bg-migratewatch-panel/80",
                )}
                onClick={() => toggleMonth(month)}
              >
                {month}
              </div>
            ))}
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

