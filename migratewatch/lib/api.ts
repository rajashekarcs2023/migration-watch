// Fetch migration data from API
export async function fetchMigrationData(species: string, year?: string, month?: string) {
  try {
    // Add more detailed logging to help debug API calls:
    console.log(
      `Attempting to fetch data for species: "${species}", year: "${year || "none"}", month: "${month || "none"}"`,
    )

    // List of valid scientific names for the API
    const validScientificNames = [
      "Gadus morhua",
      "Clupea pallasii",
      "Genypterus blacodes",
      "Squalus acanthias",
      "Deania calceus",
      "Balaenoptera physalus",
      "Centroselachus crepidater",
      "Diastobranchus capensis",
      "Galeorhinus galeus",
      "Eubalaena glacialis",
      "Centroscymnus owstonii",
      "Hyperoodon ampullatus",
      "Kurtiella bidentata",
      "Thunnus thynnus",
      "Hippoglossus hippoglossus",
      "Merluccius bilinearis",
      "Pollachius virens",
      "Urophycis tenuis",
    ]

    // Try to find an exact match in the valid scientific names
    let scientificName = ""
    for (const validName of validScientificNames) {
      if (species === validName || species.includes(validName)) {
        scientificName = validName
        break
      }
    }

    // If no match found, use a default scientific name
    if (!scientificName) {
      console.warn(`No valid scientific name found in "${species}". Using "Clupea pallasii" as default.`)
      scientificName = "Clupea pallasii"
    }

    // Construct the API URL based on the parameters
    let apiUrl = `https://flaskapi-shiphappens.azurewebsites.net/data/${encodeURIComponent(scientificName)}`

    // Add month and year if both are provided and valid
    if (month && month !== "" && month !== "all" && year && year !== "") {
      apiUrl += `/${month}/${year}`
    }
    // Add just year if provided and valid
    else if (year && year !== "") {
      apiUrl += `/${year}`
    }
    // Otherwise, just use the base URL with the fish name

    console.log("Fetching data from:", apiUrl)

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store", // Disable caching to ensure fresh data
      })

      if (!response.ok) {
        console.error(`API request failed with status ${response.status}: ${response.statusText}`)
        return { noDataFound: true, species, year, month }
      }

      const data = await response.json()
      console.log("API response received:", data)

      // Check if the data has coordinates and they're not empty
      if (!data.coordinates || data.coordinates.length === 0) {
        console.log("No coordinates found in API response")
        return { noDataFound: true, species, year, month }
      }

      return data
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return { noDataFound: true, species, year, month }
    }
  } catch (error) {
    console.error("Error in fetchMigrationData:", error)
    return { noDataFound: true, species, year, month }
  }
}

// New function to fetch shipping lane data
export async function fetchShippingLaneData(year?: string, month?: string) {
  try {
    console.log(`Attempting to fetch shipping lane data: year: "${year || "none"}", month: "${month || "none"}"`)

    // Construct the API URL based on the parameters
    let apiUrl = "https://flaskapi-shiphappens.azurewebsites.net/data/shipping"

    // Add month and year if both are provided and valid
    if (month && month !== "" && month !== "all" && year && year !== "") {
      apiUrl += `/${month}/${year}`
    }
    // Add just year if provided and valid
    else if (year && year !== "") {
      apiUrl += `/${year}`
    }
    // Otherwise, use a default (current year)
    else {
      apiUrl += "/2023"
    }

    console.log("Fetching shipping lane data from:", apiUrl)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store", // Disable caching to ensure fresh data
    })

    if (!response.ok) {
      console.error(`Shipping lane API request failed with status ${response.status}: ${response.statusText}`)
      return { noDataFound: true, year, month }
    }

    const data = await response.json()
    console.log("Shipping lane API response received:", data)

    // Check if the data has lane coordinates and they're not empty
    if (!data.lane || data.lane.length === 0 || data.status !== "1") {
      console.log("No valid shipping lane data found in API response")
      return { noDataFound: true, year, month }
    }

    // Convert the flat array of coordinates to pairs of [lng, lat]
    const coordinates: [number, number][] = []
    for (let i = 0; i < data.lane.length; i += 2) {
      if (i + 1 < data.lane.length) {
        coordinates.push([data.lane[i], data.lane[i + 1]])
      }
    }

    return {
      coordinates,
      status: data.status,
      noDataFound: false,
    }
  } catch (error) {
    console.error("Error in fetchShippingLaneData:", error)
    return { noDataFound: true, year, month }
  }
}

