import React from "react"

interface MapLabelProps {
  text: string
  position: { x: number; y: number }
  type: "info" | "warning" | "success" | "neutral"
}

export function MapLabel({ text, position, type }: MapLabelProps) {
  let bgColor = "bg-gray-100"
  let textColor = "text-gray-700"

  switch (type) {
    case "info":
      bgColor = "bg-blue-100"
      textColor = "text-blue-700"
      break
    case "warning":
      bgColor = "bg-yellow-100"
      textColor = "text-yellow-700"
      break
    case "success":
      bgColor = "bg-green-100"
      textColor = "text-green-700"
      break
    case "neutral":
    default:
      bgColor = "bg-gray-100"
      textColor = "text-gray-700"
      break
  }

  return (
    <div
      className={`absolute rounded-full px-3 py-1 text-xs font-medium ${bgColor} ${textColor} z-50`}
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      {text}
    </div>
  )
}
