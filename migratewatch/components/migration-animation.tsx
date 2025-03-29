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

    // Create particles
    const particles: { x: number; y: number; progress: number; speed: number }[] = []
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: 0,
        y: 0,
        progress: Math.random(),
        speed: 0.001 + Math.random() * 0.002 * speed,
      })
    }

    // Animation function
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the path
      ctx.beginPath()
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.stroke()

      // Update and draw particles
      particles.forEach((particle) => {
        // Update progress
        particle.progress += particle.speed
        if (particle.progress > 1) particle.progress = 0

        // Find position on the path
        const segmentIndex = Math.floor(particle.progress * (points.length - 1))
        const segmentProgress = (particle.progress * (points.length - 1)) % 1

        const start = points[segmentIndex]
        const end = points[Math.min(segmentIndex + 1, points.length - 1)]

        particle.x = start[0] + (end[0] - start[0]) * segmentProgress
        particle.y = start[1] + (end[1] - start[1]) * segmentProgress

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

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

