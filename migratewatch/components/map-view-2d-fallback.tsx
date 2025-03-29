"use client"

import { useEffect, useRef, useState } from "react"
import type { SpeciesData, TimelineData, DataLayers } from "@/lib/types"

interface MapView2DFallbackProps {
  selectedSpecies: SpeciesData
  dataLayers: DataLayers
  timelineData: TimelineData
}

export function MapView2DFallback({ selectedSpecies, dataLayers, timelineData }: MapView2DFallbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Initialize the canvas-based map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match container
    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth
        canvas.height = parent.clientHeight
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Draw the map
    drawMap(ctx, canvas.width, canvas.height, dataLayers)

    // Start animation if migration routes are enabled
    let animationFrameId: number | null = null
    if (dataLayers.migrationRoutes) {
      const particles: Particle[] = createParticles()

      const animate = () => {
        updateParticles(particles, ctx, canvas.width, canvas.height)
        animationFrameId = requestAnimationFrame(animate)
      }

      animate()
    }

    setIsLoaded(true)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [dataLayers])

  return (
    <div className="h-full w-full relative">
      <canvas ref={canvasRef} className="w-full h-full bg-migratewatch-darker" />

      {/* Overlay with detailed data */}
      <div className="absolute top-4 left-4 bg-migratewatch-panel/90 p-3 rounded-md text-xs max-w-xs">
        <h3 className="font-bold mb-2">Detailed Analysis</h3>
        <div className="space-y-2">
          <div>
            <div className="font-medium">Species: {selectedSpecies.name}</div>
            <div>Confidence Interval: 95%</div>
          </div>
          <div>
            <div className="font-medium text-migratewatch-magenta">Risk Assessment</div>
            <div className="grid grid-cols-2 gap-x-2">
              <div>Collision Risk:</div>
              <div>High (78%)</div>
              <div>Noise Impact:</div>
              <div>Medium (45%)</div>
              <div>Overall Risk:</div>
              <div className="font-bold">High</div>
            </div>
          </div>
          <div>
            <div className="font-medium text-migratewatch-orange">Shipping Data</div>
            <div>247 vessels/month</div>
            <div>Cargo: 65% | Tanker: 25%</div>
          </div>
          <div>
            <div className="font-medium text-migratewatch-green">Alternative Route</div>
            <div>Risk Reduction: 65%</div>
            <div>Distance: +42 km (+8%)</div>
          </div>
        </div>
      </div>

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-migratewatch-dark bg-opacity-80 z-20">
          <div className="text-white flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-migratewatch-cyan mb-3"></div>
            <div>Loading 2D map...</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper types
interface Particle {
  x: number
  y: number
  progress: number
  speed: number
  pathIndex: number
}

// Migration route coordinates (simplified for canvas)
const migrationRoute = [
  [0.2, 0.4], // Starting point (x, y as percentage of canvas)
  [0.3, 0.45],
  [0.4, 0.5],
  [0.5, 0.55],
  [0.6, 0.5],
  [0.7, 0.45],
  [0.8, 0.4], // End point
]

// Shipping lane coordinates
const shippingLane = [
  [0.2, 0.3],
  [0.35, 0.35],
  [0.5, 0.4],
  [0.65, 0.35],
  [0.8, 0.3],
]

// Alternative shipping lane
const alternativeShippingLane = [
  [0.2, 0.3],
  [0.35, 0.25],
  [0.5, 0.3],
  [0.65, 0.25],
  [0.8, 0.3],
]

// Conflict zones
const conflictZones = [
  { x: 0.5, y: 0.45, radius: 0.05 },
  { x: 0.35, y: 0.4, radius: 0.04 },
]

// Protected area
const protectedArea = [
  [0.4, 0.3],
  [0.5, 0.3],
  [0.5, 0.2],
  [0.4, 0.2],
]

// Draw the base map
function drawMap(ctx: CanvasRenderingContext2D, width: number, height: number, dataLayers: DataLayers) {
  // Clear canvas
  ctx.clearRect(0, 0, width, height)

  // Draw ocean background
  ctx.fillStyle = "#12233f" // migratewatch-darker
  ctx.fillRect(0, 0, width, height)

  // Draw a simple grid for reference
  ctx.strokeStyle = "#172d4f" // migratewatch-panel
  ctx.lineWidth = 1

  // Draw grid lines
  ctx.beginPath()
  for (let x = 0; x <= width; x += 50) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  for (let y = 0; y <= height; y += 50) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()

  // Draw coastlines (simplified)
  ctx.strokeStyle = "#2a3f5f"
  ctx.lineWidth = 2
  ctx.beginPath()

  // North America (simplified)
  ctx.moveTo(width * 0.1, height * 0.3)
  ctx.lineTo(width * 0.2, height * 0.4)
  ctx.lineTo(width * 0.15, height * 0.5)
  ctx.lineTo(width * 0.2, height * 0.6)

  // Europe (simplified)
  ctx.moveTo(width * 0.8, height * 0.3)
  ctx.lineTo(width * 0.7, height * 0.35)
  ctx.lineTo(width * 0.75, height * 0.45)
  ctx.lineTo(width * 0.7, height * 0.5)

  ctx.stroke()

  // Draw protected area
  ctx.fillStyle = "rgba(74, 246, 153, 0.2)" // migratewatch-green with opacity
  ctx.strokeStyle = "#4af699" // migratewatch-green
  ctx.lineWidth = 2
  ctx.beginPath()
  protectedArea.forEach((point, index) => {
    const x = point[0] * width
    const y = point[1] * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Draw data layers
  if (dataLayers.migrationRoutes) {
    drawMigrationRoutes(ctx, width, height)
  }

  if (dataLayers.shippingLanes) {
    drawShippingLanes(ctx, width, height)
    drawAlternativeRoute(ctx, width, height)
  }

  if (dataLayers.conflictZones) {
    drawConflictZones(ctx, width, height)
  }

  // Add labels
  addLabels(ctx, width, height)
}

// Draw migration routes
function drawMigrationRoutes(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw confidence interval (wider path underneath)
  ctx.strokeStyle = "rgba(76, 201, 240, 0.2)" // migratewatch-cyan with opacity
  ctx.lineWidth = 12
  ctx.beginPath()
  migrationRoute.forEach((point, index) => {
    const x = point[0] * width
    const y = point[1] * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw main route
  ctx.strokeStyle = "#4cc9f0" // migratewatch-cyan
  ctx.lineWidth = 3
  ctx.setLineDash([5, 3])
  ctx.beginPath()
  migrationRoute.forEach((point, index) => {
    const x = point[0] * width
    const y = point[1] * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
  ctx.setLineDash([])

  // Add confidence interval label
  ctx.fillStyle = "rgba(23, 45, 79, 0.8)" // migratewatch-panel with opacity
  ctx.fillRect(width * 0.4 - 60, height * 0.5 - 10, 120, 20)
  ctx.fillStyle = "white"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("95% Confidence Interval", width * 0.4, height * 0.5 + 4)
}

// Draw shipping lanes
function drawShippingLanes(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "#ff9e00" // migratewatch-orange
  ctx.lineWidth = 2
  ctx.setLineDash([8, 4])

  ctx.beginPath()
  shippingLane.forEach((point, index) => {
    const x = point[0] * width
    const y = point[1] * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
  ctx.setLineDash([])

  // Add vessel count label
  ctx.fillStyle = "rgba(23, 45, 79, 0.8)" // migratewatch-panel with opacity
  ctx.fillRect(width * 0.5 - 60, height * 0.35 - 10, 120, 20)
  ctx.fillStyle = "white"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("247 vessels/month", width * 0.5, height * 0.35 + 4)
}

// Draw alternative route
function drawAlternativeRoute(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "#4af699" // migratewatch-green
  ctx.lineWidth = 2
  ctx.setLineDash([5, 3])

  ctx.beginPath()
  alternativeShippingLane.forEach((point, index) => {
    const x = point[0] * width
    const y = point[1] * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()
  ctx.setLineDash([])

  // Add comparison metrics
  ctx.fillStyle = "rgba(23, 45, 79, 0.9)" // migratewatch-panel with opacity
  ctx.fillRect(width * 0.4 - 75, height * 0.25 - 40, 150, 80)
  ctx.fillStyle = "white"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Route Comparison", width * 0.4, height * 0.25 - 25)

  ctx.font = "10px Arial"
  ctx.textAlign = "left"
  ctx.fillText("Risk Reduction:", width * 0.4 - 70, height * 0.25 - 10)
  ctx.fillText("Distance:", width * 0.4 - 70, height * 0.25 + 5)
  ctx.fillText("Time:", width * 0.4 - 70, height * 0.25 + 20)

  ctx.fillStyle = "#4af699" // migratewatch-green
  ctx.textAlign = "right"
  ctx.fillText("65%", width * 0.4 + 70, height * 0.25 - 10)

  ctx.fillStyle = "white"
  ctx.fillText("+42 km (+8%)", width * 0.4 + 70, height * 0.25 + 5)
  ctx.fillText("+2.5 hours", width * 0.4 + 70, height * 0.25 + 20)
}

// Draw conflict zones
function drawConflictZones(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "rgba(247, 37, 133, 0.5)" // migratewatch-magenta with opacity

  conflictZones.forEach((zone) => {
    ctx.beginPath()
    ctx.arc(zone.x * width, zone.y * height, zone.radius * Math.min(width, height), 0, Math.PI * 2)
    ctx.fill()
  })

  // Add risk labels
  ctx.fillStyle = "rgba(247, 37, 133, 0.8)" // migratewatch-magenta with opacity
  ctx.fillRect(width * 0.5 - 50, height * 0.45 - 25, 100, 20)
  ctx.fillStyle = "white"
  ctx.font = "bold 12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Risk: High (87%)", width * 0.5, height * 0.45 - 10)

  ctx.fillStyle = "rgba(247, 37, 133, 0.8)" // migratewatch-magenta with opacity
  ctx.fillRect(width * 0.35 - 60, height * 0.4 - 25, 120, 20)
  ctx.fillStyle = "white"
  ctx.font = "bold 12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Risk: Medium (62%)", width * 0.35, height * 0.4 - 10)
}

// Add labels
function addLabels(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Protected area label
  ctx.fillStyle = "rgba(74, 246, 153, 0.8)" // migratewatch-green with opacity
  ctx.fillRect(width * 0.45 - 75, height * 0.25 - 10, 150, 20)
  ctx.fillStyle = "black"
  ctx.font = "bold 12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("Protected Marine Area", width * 0.45, height * 0.25 + 4)

  // High density area
  ctx.fillStyle = "rgba(76, 201, 240, 0.8)" // migratewatch-cyan with opacity
  ctx.fillRect(width * 0.6 - 50, height * 0.5 - 10, 100, 20)
  ctx.fillStyle = "black"
  ctx.font = "bold 12px Arial"
  ctx.textAlign = "center"
  ctx.fillText("High Density Area", width * 0.6, height * 0.5 + 4)
}

// Create particles for animation
function createParticles(): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < 10; i++) {
    particles.push({
      x: 0,
      y: 0,
      progress: Math.random(),
      speed: 0.001 + Math.random() * 0.002,
      pathIndex: 0,
    })
  }

  return particles
}

// Update and draw particles
function updateParticles(particles: Particle[], ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Redraw the map (without clearing to create trail effect)
  drawMap(ctx, width, height, {
    migrationRoutes: true,
    shippingLanes: true,
    conflictZones: true,
    seaTemperature: false,
  })

  // Update and draw particles
  particles.forEach((particle) => {
    // Update progress
    particle.progress += particle.speed
    if (particle.progress >= 1) {
      particle.progress = 0
    }

    // Calculate position along the path
    const pathLength = migrationRoute.length - 1
    const segmentIndex = Math.floor(particle.progress * pathLength)
    const segmentProgress = (particle.progress * pathLength) % 1

    const start = migrationRoute[segmentIndex]
    const end = migrationRoute[Math.min(segmentIndex + 1, migrationRoute.length - 1)]

    particle.x = (start[0] + (end[0] - start[0]) * segmentProgress) * width
    particle.y = (start[1] + (end[1] - start[1]) * segmentProgress) * height

    // Draw particle
    ctx.fillStyle = "#4cc9f0" // migratewatch-cyan
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw white outline
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2)
    ctx.stroke()
  })
}

