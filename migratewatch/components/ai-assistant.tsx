"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Send, User, X, Maximize, Minimize, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIAssistantProps {
  onClose: () => void
}

export function AIAssistant({ onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant"
      content: string
      timestamp: Date
    }[]
  >([
    {
      role: "assistant",
      content: "Hello! I'm your MigrateWatch assistant. How can I help you analyze marine migration patterns today?",
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when new ones are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage = {
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Based on the current data, North Atlantic Right Whales are showing increased activity in the highlighted areas. The collision risk is high (78%) in these regions.",
        "I've analyzed the shipping lanes and found that the alternative route reduces collision risk by 65% with only an 8% increase in travel distance.",
        "The protected marine area you're looking at has seen a 23% increase in whale sightings compared to last year.",
        "Current migration patterns suggest we should consider seasonal speed restrictions in the highlighted conflict zones.",
        "I can see that the sea temperature in this region has increased by 1.2°C over the past decade, which correlates with the changing migration patterns.",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      const assistantMessage = {
        role: "assistant" as const,
        content: randomResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-migratewatch-darker border-l border-migratewatch-panel transition-all duration-300",
        isExpanded ? "w-96" : "w-80",
      )}
    >
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b border-migratewatch-panel">
        <CardTitle className="text-base text-white flex items-center">
          <Bot className="h-5 w-5 mr-2 text-migratewatch-cyan" />
          MigrateWatch Assistant
        </CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={toggleExpand}>
            {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn("flex items-start space-x-2", message.role === "assistant" ? "justify-start" : "justify-end")}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-migratewatch-cyan flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-migratewatch-dark" />
              </div>
            )}

            <div
              className={cn(
                "max-w-[80%] rounded-lg p-3",
                message.role === "assistant"
                  ? "bg-migratewatch-panel text-white"
                  : "bg-migratewatch-cyan text-migratewatch-dark",
              )}
            >
              <div className="text-sm">{message.content}</div>
              <div className="text-xs opacity-70 mt-1 text-right">{formatTime(message.timestamp)}</div>
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-migratewatch-magenta flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 rounded-full bg-migratewatch-cyan flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-migratewatch-dark" />
            </div>
            <div className="bg-migratewatch-panel text-white max-w-[80%] rounded-lg p-3">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t border-migratewatch-panel">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about migration patterns, risks, or suggestions..."
            className="flex-1 bg-migratewatch-panel border-migratewatch-panel focus-visible:ring-migratewatch-cyan"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-3">
          <p className="text-xs text-gray-400">Suggested questions:</p>
          <div className="mt-1 space-y-1">
            {[
              "What areas have the highest collision risk?",
              "Suggest alternative shipping routes",
              "Show migration pattern changes over time",
              "What's the impact of sea temperature?",
            ].map((question, i) => (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-auto py-1 px-2 text-migratewatch-cyan hover:bg-migratewatch-panel"
                onClick={() => setInput(question)}
                disabled={isLoading}
              >
                <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">{question}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

