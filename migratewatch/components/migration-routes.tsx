"use client"

import { useEffect, useState } from "react"
import { MigrationAnimation } from "./migration-animation"
import type { SpeciesData } from "@/lib/types"
import { fetchMigrationData } from "@/lib/api"

interface MigrationRoutesProps {
  selectedSpecies: SpeciesData
  visible: boolean
}

export function MigrationRoutes({ selectedSpecies, visible }: MigrationRoutesProps) {
  const [routes, setRoutes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Get routes for the selected species
    const loadRoutes = async () => {
      setLoading(true)

      try {
        // Map the selected species ID to a scientific name if possible
        const scientificName = selectedSpecies.name

        // Fetch data from API using the scientific name
        const data = await fetchMigrationData(scientificName)

        if (data.noDataFound) {
          // No data found, set empty routes
          setRoutes([])
        } else if (data && data.coordinates && data.coordinates.length > 0) {
          // Format the coordinates for our application
          const apiRoute = {
            id: `${selectedSpecies.id}-route1`,
            name: `${selectedSpecies.name} - Migration Route`,
            species: selectedSpecies.id,
            coordinates: data.coordinates as [number, number][],
          }

          setRoutes([apiRoute])
        } else {
          // No valid data, set empty routes
          setRoutes([])
        }
      } catch (error) {
        console.error("Error loading migration data:", error)
        setRoutes([])
      }

      setLoading(false)
    }

    loadRoutes()
  }, [selectedSpecies])

  if (!visible) return null

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-migratewatch-panel/80 p-2 rounded-md text-xs">Loading migration data...</div>
      </div>
    )
  }

  return (
    <>
      {routes.map((route) => (
        <MigrationAnimation key={route.id} coordinates={route.coordinates} color="#4cc9f0" speed={1} />
      ))}
    </>
  )

  // Helper function to get default migration routes
  function getDefaultRoutes(speciesId: string) {
    // Default migration routes data (with realistic coordinates)
    const defaultRoute = {
      id: `${speciesId}-route1`,
      name: `${selectedSpecies.name} - Default Migration Route`,
      species: speciesId,
      coordinates: [
        [-67.0, 44.0],
        [-70.0, 42.5],
        [-71.0, 41.0],
        [-74.0, 39.0],
        [-75.5, 35.0],
        [-80.0, 32.0],
        [-81.5, 30.5],
      ] as [number, number][],
    }

    return [defaultRoute]
  }
}

