"use client"

import { useState } from "react"
import { FishIcon as Whale } from "lucide-react"
import { cn } from "@/lib/utils"
import AuthButtons from "@/components/ui/AuthButtons";
import UserProfile from "./UserProfile";

interface NavbarProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export function Navbar({ activeTab = "Dashboard", setActiveTab }: NavbarProps) {
  const [localActiveTab, setLocalActiveTab] = useState(activeTab)

  const handleTabClick = (tabName: string) => {
    if (setActiveTab) {
      setActiveTab(tabName)
    } else {
      setLocalActiveTab(tabName)
    }

    // In a real application, you would navigate to the appropriate page
    // or update the application state to show the relevant content
    console.log(`Navigating to: ${tabName}`)
  }

  // Use either the prop or local state
  const currentTab = setActiveTab ? activeTab : localActiveTab

  return (
    <header className="bg-migratewatch-darker border-b border-migratewatch-panel">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Whale className="h-8 w-8 text-migratewatch-cyan" />
            <span className="text-2xl font-bold text-white">MigrateWatch</span>
          </div>
          <nav className="hidden md:flex">
            <ul className="flex space-x-8">
              {[
                { name: "Dashboard", active: currentTab === "Dashboard" },
                { name: "Migrations", active: currentTab === "Migrations" },
                { name: "Shipping Data", active: currentTab === "Shipping Data" },
                { name: "Conflict Zones", active: currentTab === "Conflict Zones" },
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleTabClick(item.name)}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-migratewatch-cyan",
                      item.active ? "text-migratewatch-cyan" : "text-gray-300",
                    )}
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center space-x-6">
            <AuthButtons />
            <UserProfile />
            <span className="text-xs text-gray-400">Last updated: March 29, 2025 - 08:30 UTC</span>
          </div>
        </div>
      </div>
    </header>
  )
}

