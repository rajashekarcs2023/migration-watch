"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ForceRefreshButtonProps {
  onRefresh: () => void
}

export function ForceRefreshButton({ onRefresh }: ForceRefreshButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="bg-migratewatch-panel border-migratewatch-panel hover:bg-migratewatch-panel/80 hover:text-migratewatch-cyan shadow-lg"
      onClick={onRefresh}
      title="Force Refresh Map"
    >
      <RefreshCw className="h-4 w-4" />
    </Button>
  )
}

