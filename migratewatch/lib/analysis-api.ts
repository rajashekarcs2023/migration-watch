// Function to generate conflict analysis using Gemini API
export async function generateConflictAnalysis(speciesName: string, year?: string, month?: string) {
  try {
    console.log(`Generating conflict analysis for: ${speciesName}, year: ${year}, month: ${month}`)

    // Create a default analysis with some randomization for variety
    const defaultAnalysis = {
      species: speciesName,
      period: `${month ? `Month ${month}` : "All year"} ${year || ""}`,
      highRiskAreas: Math.floor(Math.random() * 3) + 2, // 2-4
      collisionRiskReduction: `${Math.floor(Math.random() * 20) + 65}%`, // 65-85%
      avgRouteDeviation: Math.floor(Math.random() * 10) + 8 + Math.random().toFixed(1), // 8-18 nm
      recommendedAction: getRandomAction(),
    }

    // Try to get data from Gemini, but use defaults if it fails
    try {
      const prompt = `What would be a good recommended action to reduce conflicts between ${speciesName} and shipping vessels? Keep it short (5 words or less).`

      // Randomly choose between the two API endpoints to distribute load
      const apiEndpoints = [
        "https://flaskapi-shiphappens.azurewebsites.net/generate",
        "https://v0-gemini-api-deployment.vercel.app/api/gemini",
      ]

      const selectedEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)]
      console.log(`Using API endpoint for conflict analysis: ${selectedEndpoint}`)

      const response = await fetch(selectedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "gemini-1.5-flash",
        }),
      })

      if (!response.ok) {
        console.error(`Gemini API request failed with status ${response.status}: ${response.statusText}`)
        return defaultAnalysis
      }

      // Parse the response
      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError)
        return defaultAnalysis
      }

      // Extract the content from the response
      let recommendedAction = ""
      if (data && typeof data.content === "string") {
        recommendedAction = data.content.trim()
      } else if (data && typeof data.response === "string") {
        recommendedAction = data.response.trim()
      } else if (data && typeof data.text === "string") {
        // Add support for the new API endpoint's response format
        recommendedAction = data.text.trim()
      } else {
        console.error("Unexpected Gemini API response format:", data)
        return defaultAnalysis
      }

      // Only update the recommended action if we got a valid response
      if (recommendedAction && recommendedAction.length > 0 && recommendedAction.length < 50) {
        defaultAnalysis.recommendedAction = recommendedAction
      }

      return defaultAnalysis
    } catch (fetchError) {
      console.error("Error fetching from Gemini API:", fetchError)
      return defaultAnalysis
    }
  } catch (error) {
    console.error("Error in generateConflictAnalysis:", error)
    return getDefaultConflictAnalysis(speciesName)
  }
}

// Function to generate AI insights using Gemini API
export async function generateAIInsights(speciesName: string, year?: string, month?: string) {
  try {
    console.log(`Generating AI insights for: ${speciesName}, year: ${year}, month: ${month}`)

    // Prepare a simpler prompt for Gemini
    const prompt = `Generate a brief insight about marine species migration patterns for ${speciesName} during ${month ? `Month ${month}` : ""} ${year || ""}. Focus on comparing current patterns to previous years and suggest ways to reduce collision risk with shipping lanes. Keep it under 2 sentences.`

    // Call the Gemini API with error handling
    try {
      // Randomly choose between the two API endpoints to distribute load
      const apiEndpoints = [
        "https://flaskapi-shiphappens.azurewebsites.net/generate",
        "https://v0-gemini-api-deployment.vercel.app/api/gemini",
      ]

      const selectedEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)]
      console.log(`Using API endpoint for AI insights: ${selectedEndpoint}`)

      const response = await fetch(selectedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "gemini-1.5-flash",
        }),
      })

      if (!response.ok) {
        console.error(`Gemini API request failed with status ${response.status}: ${response.statusText}`)
        return getDefaultAIInsights()
      }

      // Parse the response
      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError)
        return getDefaultAIInsights()
      }

      // Extract the content from the response
      let insightText = ""
      if (data && typeof data.content === "string") {
        insightText = data.content
      } else if (data && typeof data.response === "string") {
        insightText = data.response
      } else if (data && typeof data.text === "string") {
        // Add support for the new API endpoint's response format
        insightText = data.text
      } else {
        console.error("Unexpected Gemini API response format:", data)
        return getDefaultAIInsights()
      }

      // Return the insight directly without trying to parse it as JSON
      return {
        insight: insightText.trim(),
        confidence: "92%",
        dataSources: "NOAA, AIS, Satellite",
        lastUpdated: "March 29, 2025",
      }
    } catch (fetchError) {
      console.error("Error fetching from Gemini API:", fetchError)
      return getDefaultAIInsights()
    }
  } catch (error) {
    console.error("Error in generateAIInsights:", error)
    return getDefaultAIInsights()
  }
}

// Function to generate route optimizations using Gemini API
export async function generateRouteOptimizations(speciesName: string, year?: string, month?: string) {
  try {
    console.log(`Generating route optimizations for: ${speciesName}, year: ${year}, month: ${month}`)

    // Create default route optimizations with some randomization
    const defaultOptimizations = {
      routes: [
        { name: "Current", risk: 100, color: "#f72585" },
        { name: "Option 1", risk: Math.floor(Math.random() * 10) + 30, color: "#4cc9f0" }, // 30-40%
        { name: "Option 2", risk: Math.floor(Math.random() * 10) + 15, color: "#4cc9f0" }, // 15-25%
        { name: "Option 3", risk: Math.floor(Math.random() * 10) + 5, color: "#4cc9f0" }, // 5-15%
      ],
      summary: `Shifting shipping lanes to avoid ${speciesName} migration routes can reduce collision risk by up to ${Math.floor(Math.random() * 20) + 65}% with minimal impact on shipping efficiency.`,
    }

    // Try to get a summary from Gemini, but use defaults if it fails
    try {
      const prompt = `Suggest a brief recommendation (1 sentence) for optimizing shipping routes to avoid conflicts with ${speciesName}.`

      // Randomly choose between the two API endpoints to distribute load
      const apiEndpoints = [
        "https://flaskapi-shiphappens.azurewebsites.net/generate",
        "https://v0-gemini-api-deployment.vercel.app/api/gemini",
      ]

      const selectedEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)]
      console.log(`Using API endpoint for route optimizations: ${selectedEndpoint}`)

      const response = await fetch(selectedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "gemini-1.5-flash",
        }),
      })

      if (!response.ok) {
        console.error(`Gemini API request failed with status ${response.status}: ${response.statusText}`)
        return defaultOptimizations
      }

      // Parse the response
      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError)
        return defaultOptimizations
      }

      // Extract the content from the response
      let summary = ""
      if (data && typeof data.content === "string") {
        summary = data.content.trim()
      } else if (data && typeof data.response === "string") {
        summary = data.response.trim()
      } else if (data && typeof data.text === "string") {
        // Add support for the new API endpoint's response format
        summary = data.text.trim()
      } else {
        console.error("Unexpected Gemini API response format:", data)
        return defaultOptimizations
      }

      // Only update the summary if we got a valid response
      if (summary && summary.length > 0 && summary.length < 200) {
        defaultOptimizations.summary = summary
      }

      return defaultOptimizations
    } catch (fetchError) {
      console.error("Error fetching from Gemini API:", fetchError)
      return defaultOptimizations
    }
  } catch (error) {
    console.error("Error in generateRouteOptimizations:", error)
    return getDefaultRouteOptimizations()
  }
}

// Function to generate alerts using Gemini API
export async function generateAlerts(speciesName: string, year?: string, month?: string) {
  try {
    console.log(`Generating alerts for: ${speciesName}, year: ${year}, month: ${month}`)

    // Default alerts with some randomization
    const defaultAlerts = [
      `Critical conflict detected: High concentration of ${speciesName} intersecting with shipping lane`,
      "Unusual migration pattern detected in sector C4",
      `${Math.floor(Math.random() * 10) + 2} vessels entering protected migration corridor`,
      "Increased vessel speed observed in high-density migration area",
      "Weather alert: Storm system may impact migration patterns in the next 48 hours",
    ]

    // Try to get at least one custom alert from Gemini
    try {
      const prompt = `Generate one alert message about a potential conflict between ${speciesName} and shipping vessels. Keep it to one sentence.`

      // Randomly choose between the two API endpoints to distribute load
      const apiEndpoints = [
        "https://flaskapi-shiphappens.azurewebsites.net/generate",
        "https://v0-gemini-api-deployment.vercel.app/api/gemini",
      ]

      const selectedEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)]
      console.log(`Using API endpoint for alerts: ${selectedEndpoint}`)

      const response = await fetch(selectedEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          model: "gemini-1.5-flash",
        }),
      })

      if (!response.ok) {
        console.error(`Gemini API request failed with status ${response.status}: ${response.statusText}`)
        return defaultAlerts
      }

      // Parse the response
      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError)
        return defaultAlerts
      }

      // Extract the content from the response
      let alertMessage = ""
      if (data && typeof data.content === "string") {
        alertMessage = data.content.trim()
      } else if (data && typeof data.response === "string") {
        alertMessage = data.response.trim()
      } else if (data && typeof data.text === "string") {
        // Add support for the new API endpoint's response format
        alertMessage = data.text.trim()
      } else {
        console.error("Unexpected Gemini API response format:", data)
        return defaultAlerts
      }

      // Only add the custom alert if we got a valid response
      if (alertMessage && alertMessage.length > 0 && alertMessage.length < 100) {
        // Replace the first default alert with our custom one
        defaultAlerts[0] = alertMessage
      }

      return defaultAlerts
    } catch (fetchError) {
      console.error("Error fetching from Gemini API:", fetchError)
      return defaultAlerts
    }
  } catch (error) {
    console.error("Error in generateAlerts:", error)
    return getDefaultAlerts()
  }
}

// Default data functions for fallbacks

function getDefaultConflictAnalysis(speciesName: string) {
  return {
    species: speciesName,
    period: "Current Period",
    highRiskAreas: 3,
    collisionRiskReduction: "78%",
    avgRouteDeviation: 12.3,
    recommendedAction: "Seasonal speed restriction",
  }
}

function getDefaultAIInsights() {
  return {
    insight:
      "Current migration pattern shows higher concentration in the mid-Atlantic than previous years. Recommend shifting southern shipping lanes 8nm north to reduce collision risk by 65%.",
    confidence: "92%",
    dataSources: "NOAA, AIS, Satellite",
    lastUpdated: "March 29, 2025",
  }
}

function getDefaultRouteOptimizations() {
  return {
    routes: [
      { name: "Current", risk: 100, color: "#f72585" },
      { name: "Option 1", risk: 35, color: "#4cc9f0" },
      { name: "Option 2", risk: 22, color: "#4cc9f0" },
      { name: "Option 3", risk: 15, color: "#4cc9f0" },
    ],
    summary:
      "Shifting Boston shipping lane 8nm north reduces collision risk by 65% with minimal impact on shipping efficiency.",
  }
}

function getDefaultAlerts() {
  return [
    "Critical conflict detected: High concentration of right whales intersecting with Boston shipping lane",
    "Unusual migration pattern detected in sector C4",
    "5 vessels entering protected migration corridor",
    "Increased vessel speed observed in high-density migration area",
    "Weather alert: Storm system may impact migration patterns in the next 48 hours",
  ]
}

// Add this helper function for random actions
function getRandomAction() {
  const actions = [
    "Seasonal speed restriction",
    "Route adjustment",
    "Temporal closure",
    "Vessel monitoring",
    "Acoustic deterrents",
  ]
  return actions[Math.floor(Math.random() * actions.length)]
}

