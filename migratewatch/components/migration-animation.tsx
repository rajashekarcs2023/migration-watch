"use client"

import { useEffect, useRef } from "react"

interface MigrationAnimationProps {
  coordinates: [number, number][]
  color: string
  speed: number
}

export function MigrationAnimation({ coordinates, color, speed }: MigrationAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Convert geo coordinates to canvas coordinates
    const points = coordinates.map(([lng, lat]) => {
      // Simple conversion for demo purposes
      const x = (lng + 180) * (canvas.width / 360)
      const y = (90 - lat) * (canvas.height / 180)
      return [x, y]
    })

    // Animation function
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the points
      points.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Add a few animated points
      const numAnimated = Math.min(5, points.length)
      for (let i = 0; i < numAnimated; i++) {
        const idx = Math.floor(Math.random() * points.length)
        const [x, y] = points[idx]

        // Draw pulsing circle
        const time = Date.now() / 1000
        const pulse = 1 + 0.3 * Math.sin(time * 3 + i)

        ctx.beginPath()
        ctx.arc(x, y, 6 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = color + "80" // Add transparency
        ctx.fill()
      }

      requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Handle resize
    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [coordinates, color, speed])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

