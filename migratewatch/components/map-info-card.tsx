import React from "react"

interface MapInfoCardProps {
  title: string
  position: { x: number; y: number }
  species: any
  data: any
  onClose: () => void
}

export function MapInfoCard({ title, position, species, data, onClose }: MapInfoCardProps) {
  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-2">Species: {species.name}</p>
      <div className="mb-2">
        <h4 className="text-md font-semibold">Risk Assessment</h4>
        <p className="text-sm">
          Risk Level: {data.riskLevel} ({data.riskPercentage}%)
        </p>
        <p className="text-sm">Vessel Count: {data.vesselCount} vessels/month</p>
      </div>
      <div>
        <h4 className="text-md font-semibold">Recommended Action</h4>
        <p className="text-sm">{data.recommendedAction}</p>
      </div>
      <div className="mt-2">
        <h4 className="text-md font-semibold">Alternative Route</h4>
        <p className="text-sm">Distance: {data.alternativeRoute.distance}</p>
        <p className="text-sm">Risk Reduction: {data.alternativeRoute.riskReduction}</p>
        <p className="text-sm">Time Impact: {data.alternativeRoute.timeImpact}</p>
      </div>
    </div>
  )
}
