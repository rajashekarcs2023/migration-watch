"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { TimelineData } from "@/lib/types"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimelineProps {
  timelineData: TimelineData
  setTimelineData: (data: TimelineData) => void
}

export function Timeline({ timelineData, setTimelineData }: TimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(1) // January

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = Number.parseInt(e.target.value)
    setTimelineData({
      ...timelineData,
      position,
    })

    // Update current month based on position
    const newMonth = Math.max(1, Math.min(12, Math.ceil((position / 100) * 12)))
    setCurrentMonth(newMonth)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  const skipBackward = () => {
    const newPosition = Math.max(0, timelineData.position - 8.33) // ~1 month back
    setTimelineData({
      ...timelineData,
      position: newPosition,
    })
    updateMonth(newPosition)
  }

  const skipForward = () => {
    const newPosition = Math.min(100, timelineData.position + 8.33) // ~1 month forward
    setTimelineData({
      ...timelineData,
      position: newPosition,
    })
    updateMonth(newPosition)
  }

  const updateMonth = (position: number) => {
    const newMonth = Math.max(1, Math.min(12, Math.ceil((position / 100) * 12)))
    setCurrentMonth(newMonth)
  }

  // Auto-advance timeline when playing
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineData((prev) => {
          const newPosition = prev.position >= 100 ? 0 : prev.position + 0.5
          updateMonth(newPosition)
          return {
            ...prev,
            position: newPosition,
          }
        })
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, setTimelineData])

  // Get month name
  const getMonthName = (month: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    return months[month - 1]
  }

  // Format timeline label
  const formatTimelineLabel = () => {
    return `${getMonthName(currentMonth)} 2023`
  }

  return (
    <div className="h-16 bg-migratewatch-darker border-t border-migratewatch-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white">Timeline: {formatTimelineLabel()}</div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={skipBackward}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-white"
            onClick={togglePlayback}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={skipForward}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <div className="text-xs text-gray-400 ml-2">
            <span className="inline-block w-2 h-2 rounded-full bg-migratewatch-cyan mr-1"></span>
            Live tracking
          </div>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={timelineData.position}
          onChange={handleSliderChange}
          className="w-full h-2 bg-migratewatch-panel rounded-lg appearance-none cursor-pointer timeline-slider"
        />
        <div
          className="absolute top-0 left-0 h-2 bg-migratewatch-cyan rounded-l-lg pointer-events-none"
          style={{ width: `${timelineData.position}%` }}
        ></div>

        {/* Month markers */}
        <div className="absolute top-4 left-0 right-0 flex justify-between">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="text-[10px] text-gray-500"
              style={{ position: "absolute", left: `${(i / 11) * 100}%`, transform: "translateX(-50%)" }}
            >
              {getMonthName(i + 1).substring(0, 3)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

