"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Species info page error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-migratewatch-dark text-white flex items-center justify-center p-4">
      <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-8">
            <AlertTriangle className="h-12 w-12 text-migratewatch-magenta mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              We encountered an error while loading the species information. Please try again or return to the
              dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={reset}
                className="bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark"
              >
                Try again
              </Button>
              <Link href="/">
                <Button variant="outline" className="border-migratewatch-panel hover:bg-migratewatch-panel/50">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

