// Simple script to test the Gemini API endpoint

async function testGeminiAPI(input) {
  try {
    // Call the API
    console.log(`Sending request with prompt: "${input}"`)
    const response = await fetch("https://flaskapi-shiphappens.azurewebsites.net/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
      }),
    })

    // Try to get the response body even if status code is an error
    let responseText;
    try {
      responseText = await response.text();
      console.log("Response body:", responseText);
    } catch (e) {
      console.log("Could not read response body:", e.message);
    }

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse the response
    try {
      const data = JSON.parse(responseText);
      console.log("API Response:", data);
      return data;
    } catch (e) {
      console.log("Could not parse JSON response:", e.message);
      return responseText;
    }
  } catch (error) {
    console.error("Error calling API:", error.message);
  }
}

// Test with a sample prompt
const testPrompt = "Tell me a short story";
testGeminiAPI(testPrompt);

// Also try with fetch options that might help with CORS or other issues
setTimeout(() => {
  console.log("\nTrying with additional fetch options...");
  fetch("https://flaskapi-shiphappens.azurewebsites.net/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      prompt: "Tell me a short story",
    }),
    mode: "cors",
  })
  .then(response => {
    console.log("Status:", response.status);
    return response.text();
  })
  .then(text => {
    console.log("Response:", text);
    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
    } catch (e) {
      console.log("Not valid JSON");
    }
  })
  .catch(error => {
    console.error("Fetch error:", error.message);
  });
}, 2000);
