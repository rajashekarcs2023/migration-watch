import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-migratewatch-dark text-white flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-migratewatch-cyan animate-spin mb-4" />
        <p className="text-lg">Loading species information...</p>
      </div>
    </div>
  )
}

