"use client"

import { useEffect, useRef, useState } from "react"

interface Observation {
  decimalLatitude: number
  decimalLongitude: number
  depth?: number
  date_year?: number
  sst?: number // sea surface temperature
  sss?: number // sea surface salinity
  shoredistance?: number
}

interface SpeciesDistributionMapProps {
  observations: Observation[]
  speciesName: string
}

export function SpeciesDistributionMap({ observations, speciesName }: SpeciesDistributionMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  // Set up canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        const { width, height } = canvasRef.current.parentElement.getBoundingClientRect()
        setDimensions({ width, height })
        canvasRef.current.width = width
        canvasRef.current.height = height
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Draw the map when observations or dimensions change
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || observations.length === 0) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height)

    // Draw map background
    drawMapBackground(ctx, dimensions.width, dimensions.height)

    // Find the bounds of the observations
    const bounds = calculateBounds(observations)

    // Draw coastline (simplified)
    drawCoastline(ctx, dimensions.width, dimensions.height)

    // Draw grid
    drawGrid(ctx, dimensions.width, dimensions.height, bounds)

    // Draw observations
    drawObservations(ctx, dimensions.width, dimensions.height, observations, bounds)

    // Add labels
    addLabels(ctx, dimensions.width, dimensions.height, bounds, speciesName)

    setIsLoaded(true)
  }, [observations, dimensions, speciesName])

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <canvas ref={canvasRef} className="w-full h-full bg-migratewatch-darker rounded-md" />
      {!isLoaded && observations.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-migratewatch-cyan"></div>
        </div>
      )}
    </div>
  )
}

// Calculate the bounds of the observations
function calculateBounds(observations: Observation[]) {
  let minLat = 90,
    maxLat = -90,
    minLng = 180,
    maxLng = -180

  observations.forEach((obs) => {
    minLat = Math.min(minLat, obs.decimalLatitude)
    maxLat = Math.max(maxLat, obs.decimalLatitude)
    minLng = Math.min(minLng, obs.decimalLongitude)
    maxLng = Math.max(maxLng, obs.decimalLongitude)
  })

  // Add some padding
  const latPadding = (maxLat - minLat) * 0.1
  const lngPadding = (maxLng - minLng) * 0.1

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
  }
}

// Draw the map background
function drawMapBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Ocean background
  ctx.fillStyle = "#12233f" // migratewatch-darker
  ctx.fillRect(0, 0, width, height)
}

// Draw a simplified coastline
function drawCoastline(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // California coastline (simplified)
  ctx.strokeStyle = "#2a3f5f"
  ctx.lineWidth = 2
  ctx.beginPath()

  // Draw a simplified California coastline
  ctx.moveTo(width * 0.2, height * 0.1)
  ctx.lineTo(width * 0.3, height * 0.3)
  ctx.lineTo(width * 0.25, height * 0.5)
  ctx.lineTo(width * 0.3, height * 0.7)
  ctx.lineTo(width * 0.4, height * 0.9)

  ctx.stroke()
}

// Draw the grid
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const { minLat, maxLat, minLng, maxLng } = bounds

  // Draw grid lines
  ctx.strokeStyle = "#172d4f" // migratewatch-panel
  ctx.lineWidth = 1
  ctx.beginPath()

  // Latitude lines
  const latStep = Math.ceil((maxLat - minLat) / 5)
  for (let lat = Math.floor(minLat); lat <= Math.ceil(maxLat); lat += latStep) {
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)

    // Add latitude label
    ctx.fillStyle = "#8b9cb3"
    ctx.font = "10px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`${lat.toFixed(0)}°N`, 5, y - 5)
  }

  // Longitude lines
  const lngStep = Math.ceil((maxLng - minLng) / 5)
  for (let lng = Math.floor(minLng); lng <= Math.ceil(maxLng); lng += lngStep) {
    const x = ((lng - minLng) / (maxLng - minLng)) * width
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)

    // Add longitude label
    ctx.fillStyle = "#8b9cb3"
    ctx.font = "10px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${Math.abs(lng).toFixed(0)}°W`, x, height - 5)
  }

  ctx.stroke()
}

// Draw the observations
function drawObservations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  observations: Observation[],
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
) {
  const { minLat, maxLat, minLng, maxLng } = bounds

  // Find min/max values for color scaling
  let minDepth = Number.POSITIVE_INFINITY,
    maxDepth = Number.NEGATIVE_INFINITY
  let minTemp = Number.POSITIVE_INFINITY,
    maxTemp = Number.NEGATIVE_INFINITY

  observations.forEach((obs) => {
    if (obs.depth !== undefined) {
      minDepth = Math.min(minDepth, obs.depth)
      maxDepth = Math.max(maxDepth, obs.depth)
    }
    if (obs.sst !== undefined) {
      minTemp = Math.min(minTemp, obs.sst)
      maxTemp = Math.max(maxTemp, obs.sst)
    }
  })

  // Draw each observation
  observations.forEach((obs) => {
    // Convert lat/lng to x/y coordinates
    const x = ((obs.decimalLongitude - minLng) / (maxLng - minLng)) * width
    const y = height - ((obs.decimalLatitude - minLat) / (maxLat - minLat)) * height

    // Determine point color based on temperature (if available)
    let pointColor = "#4cc9f0" // Default cyan
    if (obs.sst !== undefined && maxTemp !== minTemp) {
      // Color gradient from blue (cold) to red (warm)
      const tempRatio = (obs.sst - minTemp) / (maxTemp - minTemp)
      const r = Math.floor(20 + tempRatio * 235)
      const g = Math.floor(201 - tempRatio * 150)
      const b = Math.floor(240 - tempRatio * 180)
      pointColor = `rgb(${r}, ${g}, ${b})`
    }

    // Determine point size based on depth (if available)
    let pointSize = 4
    if (obs.depth !== undefined && maxDepth !== minDepth) {
      // Deeper = smaller point
      const depthRatio = (obs.depth - minDepth) / (maxDepth - minDepth)
      pointSize = 6 - depthRatio * 3
    }

    // Draw point
    ctx.beginPath()
    ctx.arc(x, y, pointSize, 0, Math.PI * 2)
    ctx.fillStyle = pointColor
    ctx.fill()

    // Add white outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Add legend
  drawLegend(ctx, width, height, minTemp, maxTemp, minDepth, maxDepth)
}

// Draw the legend
function drawLegend(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  minTemp: number,
  maxTemp: number,
  minDepth: number,
  maxDepth: number,
) {
  // Background for legend
  ctx.fillStyle = "rgba(18, 35, 63, 0.8)" // migratewatch-darker with opacity
  ctx.fillRect(width - 130, 10, 120, 100)
  ctx.strokeStyle = "#2a3f5f"
  ctx.lineWidth = 1
  ctx.strokeRect(width - 130, 10, 120, 100)

  // Title
  ctx.fillStyle = "white"
  ctx.font = "bold 10px Arial"
  ctx.textAlign = "center"
  ctx.fillText("OBSERVATION LEGEND", width - 70, 25)

  // Temperature gradient
  if (minTemp !== Number.POSITIVE_INFINITY && maxTemp !== Number.NEGATIVE_INFINITY) {
    ctx.fillStyle = "white"
    ctx.font = "9px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Temperature:", width - 125, 40)

    // Draw gradient bar
    const gradientX = width - 125
    const gradientY = 45
    const gradientWidth = 80
    const gradientHeight = 10

    const gradient = ctx.createLinearGradient(gradientX, gradientY, gradientX + gradientWidth, gradientY)
    gradient.addColorStop(0, "rgb(20, 201, 240)") // Cold (blue)
    gradient.addColorStop(1, "rgb(255, 51, 60)") // Warm (red)

    ctx.fillStyle = gradient
    ctx.fillRect(gradientX, gradientY, gradientWidth, gradientHeight)

    // Add min/max labels
    ctx.fillStyle = "white"
    ctx.font = "8px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`${minTemp.toFixed(1)}°C`, gradientX, gradientY + gradientHeight + 10)
    ctx.textAlign = "right"
    ctx.fillText(`${maxTemp.toFixed(1)}°C`, gradientX + gradientWidth, gradientY + gradientHeight + 10)
  }

  // Depth legend
  if (minDepth !== Number.POSITIVE_INFINITY && maxDepth !== Number.NEGATIVE_INFINITY) {
    ctx.fillStyle = "white"
    ctx.font = "9px Arial"
    ctx.textAlign = "left"
    ctx.fillText("Depth:", width - 125, 75)

    // Draw depth circles
    const smallCircleX = width - 115
    const largeCircleX = width - 85
    const circleY = 85

    // Small circle (deep)
    ctx.beginPath()
    ctx.arc(smallCircleX, circleY, 3, 0, Math.PI * 2)
    ctx.fillStyle = "#4cc9f0"
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Large circle (shallow)
    ctx.beginPath()
    ctx.arc(largeCircleX, circleY, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#4cc9f0"
    ctx.fill()
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Add labels
    ctx.fillStyle = "white"
    ctx.font = "8px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${maxDepth.toFixed(1)}m`, smallCircleX, circleY + 15)
    ctx.fillText(`${minDepth.toFixed(1)}m`, largeCircleX, circleY + 15)
  }
}

// Add labels to the map
function addLabels(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  speciesName: string,
) {
  // Add title
  ctx.fillStyle = "white"
  ctx.font = "bold 12px Arial"
  ctx.textAlign = "left"
  ctx.fillText(`Distribution Map: ${speciesName}`, 10, 20)

  // Add subtitle with coordinate bounds
  ctx.fillStyle = "#8b9cb3"
  ctx.font = "10px Arial"
  ctx.fillText(
    `Lat: ${bounds.minLat.toFixed(2)}°N to ${bounds.maxLat.toFixed(2)}°N | Lon: ${bounds.minLng.toFixed(2)}°W to ${bounds.maxLng.toFixed(2)}°W`,
    10,
    35,
  )
}

