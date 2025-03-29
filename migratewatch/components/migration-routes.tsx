"use client"

import { useEffect, useState } from "react"
import { MigrationAnimation } from "./migration-animation"
import type { SpeciesData } from "@/lib/types"

interface MigrationRoutesProps {
  selectedSpecies: SpeciesData
  visible: boolean
}

export function MigrationRoutes({ selectedSpecies, visible }: MigrationRoutesProps) {
  const [routes, setRoutes] = useState<any[]>([])

  useEffect(() => {
    // Get routes for the selected species
    const speciesRoutes = getMigrationRoutes(selectedSpecies.id)
    setRoutes(speciesRoutes)
  }, [selectedSpecies])

  if (!visible) return null

  return (
    <>
      {routes.map((route) => (
        <MigrationAnimation key={route.id} coordinates={route.coordinates} color="#4cc9f0" speed={1} />
      ))}
    </>
  )

  // Helper function to get migration routes
  function getMigrationRoutes(speciesId: string) {
    // Migration routes data (with realistic coordinates)
    const allRoutes = [
      {
        id: "narw-route1",
        name: "North Atlantic Right Whale - Gulf of Maine to Florida",
        species: "narw",
        coordinates: [
          [-67.0, 44.0], // Gulf of Maine
          [-70.0, 42.5], // Massachusetts Bay
          [-71.0, 41.0], // Rhode Island
          [-74.0, 39.0], // New Jersey
          [-75.5, 35.0], // North Carolina
          [-80.0, 32.0], // South Carolina
          [-81.5, 30.5], // Florida
        ] as [number, number][],
      },
      {
        id: "humpback-route1",
        name: "Humpback Whale - Caribbean to Greenland",
        species: "humpback",
        coordinates: [
          [-66.0, 18.0], // Caribbean
          [-70.0, 25.0], // Bahamas
          [-75.0, 35.0], // North Carolina
          [-70.0, 40.0], // New England
          [-60.0, 45.0], // Nova Scotia
          [-50.0, 50.0], // Newfoundland
          [-45.0, 60.0], // Greenland
        ] as [number, number][],
      },
      {
        id: "blue-route1",
        name: "Blue Whale - California to Alaska",
        species: "blue",
        coordinates: [
          [-120.0, 32.0], // Southern California
          [-123.0, 37.0], // Central California
          [-125.0, 42.0], // Oregon
          [-125.0, 47.0], // Washington
          [-132.0, 52.0], // British Columbia
          [-140.0, 58.0], // Alaska
        ] as [number, number][],
      },
      {
        id: "loggerhead-route1",
        name: "Loggerhead Sea Turtle - Florida to Mediterranean",
        species: "loggerhead",
        coordinates: [
          [-80.0, 25.0], // Florida
          [-75.0, 30.0], // Atlantic
          [-60.0, 35.0], // Mid-Atlantic
          [-40.0, 38.0], // Azores
          [-10.0, 36.0], // Gibraltar
          [5.0, 38.0], // Mediterranean
        ] as [number, number][],
      },
    ]

    return speciesId === "all" ? allRoutes : allRoutes.filter((route) => route.species === speciesId)
  }
}

