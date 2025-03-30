"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface MapLabelProps {
  text: string
  position: { x: number; y: number } | null
  type?: "info" | "warning" | "success" | "neutral"
  icon?: React.ReactNode
  className?: string
}

export function MapLabel({ text, position, type = "neutral", icon, className = "" }: MapLabelProps) {
  const [isVisible, setIsVisible] = useState(false)

  // Default position if none provided
  const safePosition = position || { x: 50, y: 50 }

  // Set colors based on type
  let bgColor = "bg-migratewatch-panel/90"
  let borderColor = "border-migratewatch-panel"
  let textColor = "text-white"

  if (type === "info") {
    bgColor = "bg-migratewatch-cyan"
    borderColor = "border-migratewatch-cyan/50"
    textColor = "text-migratewatch-dark"
  } else if (type === "warning") {
    bgColor = "bg-migratewatch-magenta"
    borderColor = "border-migratewatch-magenta/50"
    textColor = "text-white"
  } else if (type === "success") {
    bgColor = "bg-migratewatch-green"
    borderColor = "border-migratewatch-green/50"
    textColor = "text-black"
  }

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`absolute transition-all duration-300 ${isVisible ? "opacity-100 transform-none" : "opacity-0 translate-y-2"} ${className}`}
      style={{
        left: `${safePosition.x}px`,
        top: `${safePosition.y}px`,
        zIndex: 900,
        transform: "translate(-50%, -50%)",
        maxWidth: "200px",
      }}
    >
      <div
        className={`${bgColor} ${textColor} text-xs font-medium p-2 rounded-lg shadow-lg border ${borderColor} flex items-center`}
      >
        {icon && <span className="mr-1.5">{icon}</span>}
        {text}
      </div>
    </div>
  )
}

