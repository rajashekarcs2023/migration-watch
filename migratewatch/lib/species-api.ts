// Function to fetch species data from OBIS API
export async function fetchSpeciesData(scientificName: string) {
  try {
    console.log(`Fetching OBIS data for species: "${scientificName}"`)

    // Encode the scientific name for URL
    const encodedName = encodeURIComponent(scientificName)
    const apiUrl = `https://api.obis.org/v3/occurrence?scientificname=${encodedName}`

    console.log("Fetching data from:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Disable caching to ensure fresh data
    })

    if (!response.ok) {
      console.error(`OBIS API request failed with status ${response.status}: ${response.statusText}`)
      return { error: true, message: `Failed to fetch data: ${response.statusText}` }
    }

    const data = await response.json()
    console.log("OBIS API response received with", data.total, "records")

    // If no results found
    if (!data.results || data.results.length === 0) {
      return { error: true, message: "No data found for this species" }
    }

    // Process the data with Gemini API
    return await processWithGemini(data)
  } catch (error) {
    console.error("Error in fetchSpeciesData:", error)
    return { error: true, message: "An error occurred while fetching species data" }
  }
}

// Update the processWithGemini function to use both API endpoints in a round-robin fashion
async function processWithGemini(obisData: any) {
  try {
    console.log("Processing data with Gemini API")

    // Prepare the prompt for Gemini
    const prompt = `Analyze the following marine species observation data and extract key information:
${JSON.stringify(obisData)}

Please provide:
1. Species identification (scientific name and common name if available)
2. Geographic distribution summary (latitude/longitude range, specific regions mentioned)
3. Temporal patterns (observation years, any seasonal patterns)
4. Habitat characteristics (depth range, distance from shore, water temperature, salinity)
5. Conservation implications (population trends, potential threats, habitat importance)
6. Key statistics (number of observations, average depth, temperature range)`

    // Randomly choose between the two API endpoints to distribute load
    const apiEndpoints = [
      "https://flaskapi-shiphappens.azurewebsites.net/generate",
      "https://v0-gemini-api-deployment.vercel.app/api/gemini",
    ]

    const selectedEndpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)]
    console.log(`Using API endpoint: ${selectedEndpoint}`)

    // Call the selected Gemini API
    const response = await fetch(selectedEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        // Include model parameter for the new endpoint
        model: "gemini-1.5-flash",
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API request failed: ${errorText}`)
      return { error: true, message: "Failed to analyze species data" }
    }

    // Parse the response
    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError)
      return { error: true, message: "Failed to parse analysis results" }
    }

    // Extract the content from the response
    let analysisContent = ""
    if (data && typeof data.content === "string") {
      analysisContent = data.content
    } else if (data && typeof data.response === "string") {
      analysisContent = data.response
    } else if (data && typeof data.text === "string") {
      // Add support for the new API endpoint's response format
      analysisContent = data.text
    } else {
      console.error("Unexpected Gemini API response format:", data)
      return { error: true, message: "Unexpected response format from analysis" }
    }

    // Return the raw OBIS data and the Gemini analysis
    return {
      error: false,
      obisData: obisData,
      analysis: analysisContent,
    }
  } catch (error) {
    console.error("Error in processWithGemini:", error)
    return { error: true, message: "An error occurred while analyzing species data" }
  }
}

