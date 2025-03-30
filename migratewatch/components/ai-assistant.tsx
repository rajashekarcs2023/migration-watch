"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Fish, Send, User, X, Maximize, Minimize, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

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
      content: "Hello! I'm your OceanPulse assistant. How can I help you analyze marine migration patterns today?",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Store the current input value before clearing it
    const currentInput = input.trim()

    // Add user message
    const userMessage = {
      role: "user" as const,
      content: currentInput,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      console.log("Sending request to Gemini API with prompt:", currentInput)

      // Call the Gemini API with proper error handling
      const response = await fetch("https://flaskapi-shiphappens.azurewebsites.net/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentInput,
        }),
      })

      console.log("API response status:", response.status)

      // Get the raw text first for debugging
      const responseText = await response.text()
      console.log("API raw response:", responseText)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${responseText}`)
      }

      // Parse the JSON manually after confirming it's valid
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Parsed response data:", data)
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError)
        throw new Error("Invalid JSON response from API")
      }

      // Check if the response contains the expected data
      // The API returns data.content instead of data.response
      let responseContent = ""

      if (data && typeof data.content === "string") {
        // Use the content field from the response
        responseContent = data.content
      } else if (data && typeof data.response === "string") {
        // Fallback to response field if content is not available
        responseContent = data.response
      } else {
        console.error("Unexpected response format:", data)
        throw new Error("Unexpected response format from API")
      }

      const assistantMessage = {
        role: "assistant" as const,
        content: responseContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Detailed error calling Gemini API:", error)

      // Add error message
      const errorMessage = {
        role: "assistant" as const,
        content: "I'm sorry, there was an error processing your request. Please try again later.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  // Custom renderer for markdown content
  const MessageContent = ({ content, role }: { content: string; role: "user" | "assistant" }) => {
    if (role === "user") {
      // Don't apply markdown to user messages
      return <div className="text-sm">{content}</div>
    }

    return (
      <div className="text-sm markdown-content">
        <ReactMarkdown
          components={{
            // Customize heading styles
            h1: ({ node, ...props }) => <h1 className="text-lg font-bold my-2" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-base font-bold my-2" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-sm font-bold my-1" {...props} />,
            h4: ({ node, ...props }) => <h4 className="text-sm font-semibold my-1" {...props} />,
            // Customize paragraph styles
            p: ({ node, ...props }) => <p className="my-1.5" {...props} />,
            // Customize list styles
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-1.5" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-1.5" {...props} />,
            li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
            // Customize code styles
            code: ({ node, inline, ...props }) =>
              inline ? (
                <code className="bg-migratewatch-dark px-1 py-0.5 rounded text-xs" {...props} />
              ) : (
                <code className="block bg-migratewatch-dark p-2 rounded text-xs my-2 overflow-x-auto" {...props} />
              ),
            // Customize emphasis styles
            em: ({ node, ...props }) => <em className="italic" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            // Customize link styles
            a: ({ node, ...props }) => <a className="text-migratewatch-cyan underline" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-migratewatch-darker border-l border-migratewatch-panel transition-all duration-300",
        isExpanded ? "w-[600px]" : "w-80",
      )}
    >
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b border-migratewatch-panel">
        <CardTitle className="text-base text-white flex items-center">
          <Fish className="h-5 w-5 mr-2 text-migratewatch-cyan" />
          OceanPulse Assistant
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
                <Fish className="h-4 w-4 text-migratewatch-dark" />
              </div>
            )}

            <div
              className={cn(
                "rounded-lg p-3",
                message.role === "assistant"
                  ? "bg-migratewatch-panel text-white max-w-[90%]"
                  : "bg-migratewatch-cyan text-migratewatch-dark max-w-[75%]",
              )}
            >
              <MessageContent content={message.content} role={message.role} />
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
              <Fish className="h-4 w-4 text-migratewatch-dark" />
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

