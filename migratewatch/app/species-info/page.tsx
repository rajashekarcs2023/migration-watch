"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { fetchSpeciesData } from "@/lib/species-api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, Fish, Loader2, AlertTriangle, MapPin, Calendar, Droplets, Shield, BarChart2 } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { SpeciesDistributionMap } from "@/components/species-distribution-map"

export default function SpeciesInfoPage() {
  const searchParams = useSearchParams()
  const speciesName = searchParams.get("name") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [speciesData, setSpeciesData] = useState<any>(null)
  const [analysisContent, setAnalysisContent] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("overview")

  useEffect(() => {
    async function loadSpeciesData() {
      if (!speciesName) {
        setError("No species name provided")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await fetchSpeciesData(speciesName)

        if (data.error) {
          setError(data.message)
        } else {
          setSpeciesData(data.obisData)
          setAnalysisContent(data.analysis)
        }
      } catch (err) {
        console.error("Error loading species data:", err)
        setError("Failed to load species information")
      } finally {
        setLoading(false)
      }
    }

    loadSpeciesData()
  }, [speciesName])

  // Extract basic stats from the OBIS data
  const extractStats = () => {
    if (!speciesData || !speciesData.results || speciesData.results.length === 0) {
      return null
    }

    const results = speciesData.results

    // Calculate average depth
    const depths = results.filter((r: any) => r.depth).map((r: any) => r.depth)
    const avgDepth =
      depths.length > 0 ? (depths.reduce((sum: number, d: number) => sum + d, 0) / depths.length).toFixed(1) : "N/A"

    // Calculate temperature range
    const temps = results.filter((r: any) => r.sst).map((r: any) => r.sst)
    const minTemp = temps.length > 0 ? Math.min(...temps).toFixed(1) : "N/A"
    const maxTemp = temps.length > 0 ? Math.max(...temps).toFixed(1) : "N/A"

    // Calculate salinity average
    const salinities = results.filter((r: any) => r.sss).map((r: any) => r.sss)
    const avgSalinity =
      salinities.length > 0
        ? (salinities.reduce((sum: number, s: number) => sum + s, 0) / salinities.length).toFixed(2)
        : "N/A"

    // Get observation years range
    const years = results.filter((r: any) => r.date_year).map((r: any) => r.date_year)
    const minYear = years.length > 0 ? Math.min(...years) : "N/A"
    const maxYear = years.length > 0 ? Math.max(...years) : "N/A"

    // Calculate shore distance average
    const distances = results.filter((r: any) => r.shoredistance).map((r: any) => r.shoredistance)
    const avgDistance =
      distances.length > 0
        ? (distances.reduce((sum: number, d: number) => sum + d, 0) / distances.length).toFixed(0)
        : "N/A"

    return {
      totalObservations: speciesData.total || results.length,
      avgDepth,
      tempRange: `${minTemp} - ${maxTemp}°C`,
      avgSalinity,
      yearRange: `${minYear} - ${maxYear}`,
      avgShoreDistance: avgDistance,
    }
  }

  const stats = speciesData ? extractStats() : null

  // Parse the analysis content into sections
  const parseAnalysisContent = () => {
    if (!analysisContent) return {}

    const sections: Record<string, string> = {
      overview: "",
      distribution: "",
      temporal: "",
      habitat: "",
      conservation: "",
    }

    // Simple parsing based on headings
    let currentSection = "overview"

    const lines = analysisContent.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()

      if (line.includes("species identification") || line.includes("species:") || line.includes("overview")) {
        currentSection = "overview"
      } else if (line.includes("geographic distribution") || line.includes("distribution")) {
        currentSection = "distribution"
      } else if (line.includes("temporal patterns") || line.includes("temporal")) {
        currentSection = "temporal"
      } else if (line.includes("habitat characteristics") || line.includes("habitat")) {
        currentSection = "habitat"
      } else if (line.includes("conservation implications") || line.includes("conservation")) {
        currentSection = "conservation"
      }

      sections[currentSection] += lines[i] + "\n"
    }

    return sections
  }

  const sections = parseAnalysisContent()

  return (
    <div className="min-h-screen bg-migratewatch-dark text-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-migratewatch-panel/50 mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <Fish className="mr-2 h-6 w-6 text-migratewatch-cyan" />
            Species Information
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-migratewatch-cyan animate-spin mb-4" />
            <p className="text-lg">Loading species information...</p>
          </div>
        ) : error ? (
          <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center py-8">
                <AlertTriangle className="h-12 w-12 text-migratewatch-magenta mb-4" />
                <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
                <p className="text-gray-300 mb-4">{error}</p>
                <Link href="/">
                  <Button className="bg-migratewatch-cyan hover:bg-migratewatch-cyan/80 text-migratewatch-dark">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Species Header Card */}
            <Card className="bg-gradient-to-r from-migratewatch-panel to-migratewatch-panel/70 border-migratewatch-panel shadow-none mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-migratewatch-cyan mb-1">{speciesName}</h2>
                    <p className="text-gray-300 text-sm mb-2">
                      {speciesData?.results?.[0]?.kingdom || ""} &gt; {speciesData?.results?.[0]?.phylum || ""} &gt;{" "}
                      {speciesData?.results?.[0]?.class || ""}
                    </p>
                    <div className="flex items-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-migratewatch-cyan/20 text-migratewatch-cyan text-xs font-medium">
                        {speciesData?.total || 0} Observations
                      </span>
                      {speciesData?.results?.[0]?.marine && (
                        <span className="ml-2 inline-block px-3 py-1 rounded-full bg-migratewatch-green/20 text-migratewatch-green text-xs font-medium">
                          Marine Species
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                    <Button
                      variant="ghost"
                      className={`flex items-center ${activeTab === "overview" ? "bg-migratewatch-cyan/20 text-migratewatch-cyan" : "text-gray-300 hover:bg-migratewatch-panel/50"}`}
                      onClick={() => setActiveTab("overview")}
                    >
                      <Fish className="mr-2 h-4 w-4" />
                      Overview
                    </Button>
                    <Button
                      variant="ghost"
                      className={`flex items-center ${activeTab === "distribution" ? "bg-migratewatch-cyan/20 text-migratewatch-cyan" : "text-gray-300 hover:bg-migratewatch-panel/50"}`}
                      onClick={() => setActiveTab("distribution")}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Distribution
                    </Button>
                    <Button
                      variant="ghost"
                      className={`flex items-center ${activeTab === "habitat" ? "bg-migratewatch-cyan/20 text-migratewatch-cyan" : "text-gray-300 hover:bg-migratewatch-panel/50"}`}
                      onClick={() => setActiveTab("habitat")}
                    >
                      <Droplets className="mr-2 h-4 w-4" />
                      Habitat
                    </Button>
                    <Button
                      variant="ghost"
                      className={`flex items-center ${activeTab === "conservation" ? "bg-migratewatch-cyan/20 text-migratewatch-cyan" : "text-gray-300 hover:bg-migratewatch-panel/50"}`}
                      onClick={() => setActiveTab("conservation")}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Conservation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content area */}
              <div className="lg:col-span-2">
                {/* Distribution Map */}
                {activeTab === "distribution" && (
                  <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none mb-6">
                    <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                      <CardTitle className="text-xl text-white flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-migratewatch-cyan" />
                        Geographic Distribution
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Observation locations from OBIS database
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[400px] mb-4">
                        <SpeciesDistributionMap observations={speciesData?.results || []} speciesName={speciesName} />
                      </div>
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>
                          {sections.distribution || "No distribution information available."}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <>
                    <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none mb-6">
                      <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                        <CardTitle className="text-xl text-white flex items-center">
                          <Fish className="mr-2 h-5 w-5 text-migratewatch-cyan" />
                          Species Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6 prose prose-invert max-w-none">
                        <ReactMarkdown>{sections.overview || "No overview information available."}</ReactMarkdown>
                      </CardContent>
                    </Card>

                    {/* Historical & Interesting Facts Panel */}
                    <Card className="bg-gradient-to-r from-migratewatch-panel/90 to-migratewatch-panel/70 border-migratewatch-panel shadow-none mb-6">
                      <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                        <CardTitle className="text-xl text-white flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-5 w-5 text-migratewatch-orange"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          Historical & Interesting Facts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="bg-migratewatch-orange/20 p-1.5 rounded-full mr-3 mt-0.5">
                              <div className="w-2 h-2 bg-migratewatch-orange rounded-full"></div>
                            </div>
                            <div>
                              <h3 className="text-white font-medium mb-1">Historical Significance</h3>
                              <p className="text-gray-300 text-sm">
                                This species has been documented in scientific literature since the early 1800s, first
                                described by naturalist Menzies during the Vancouver Expedition. It was named after its
                                distinctive feather-like appearance that resembles a boa.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-migratewatch-cyan/20 p-1.5 rounded-full mr-3 mt-0.5">
                              <div className="w-2 h-2 bg-migratewatch-cyan rounded-full"></div>
                            </div>
                            <div>
                              <h3 className="text-white font-medium mb-1">Ecological Importance</h3>
                              <p className="text-gray-300 text-sm">
                                This kelp species creates complex underwater forests that serve as critical habitat for
                                numerous marine species. A single kelp plant can support over 40 different species of
                                fish and hundreds of invertebrate species.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-migratewatch-green/20 p-1.5 rounded-full mr-3 mt-0.5">
                              <div className="w-2 h-2 bg-migratewatch-green rounded-full"></div>
                            </div>
                            <div>
                              <h3 className="text-white font-medium mb-1">Adaptation & Resilience</h3>
                              <p className="text-gray-300 text-sm">
                                This species has developed remarkable adaptations to survive in high-energy coastal
                                environments. Its flexible stipe (stem) can withstand powerful wave forces, and it can
                                regrow from its holdfast after storm damage.
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <div className="bg-migratewatch-magenta/20 p-1.5 rounded-full mr-3 mt-0.5">
                              <div className="w-2 h-2 bg-migratewatch-magenta rounded-full"></div>
                            </div>
                            <div>
                              <h3 className="text-white font-medium mb-1">Climate Change Indicator</h3>
                              <p className="text-gray-300 text-sm">
                                Scientists are monitoring this species as an indicator of climate change impacts.
                                Changes in its distribution and abundance can signal shifts in ocean temperature,
                                chemistry, and ecosystem health.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Habitat Tab */}
                {activeTab === "habitat" && (
                  <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none mb-6">
                    <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                      <CardTitle className="text-xl text-white flex items-center">
                        <Droplets className="mr-2 h-5 w-5 text-migratewatch-cyan" />
                        Habitat Characteristics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-migratewatch-panel/50 p-4 rounded-lg">
                          <div className="text-migratewatch-cyan text-sm font-medium mb-1">Depth Range</div>
                          <div className="text-2xl font-bold">{stats?.avgDepth} m</div>
                          <div className="text-gray-400 text-xs mt-1">Average observation depth</div>
                        </div>
                        <div className="bg-migratewatch-panel/50 p-4 rounded-lg">
                          <div className="text-migratewatch-orange text-sm font-medium mb-1">Temperature</div>
                          <div className="text-2xl font-bold">{stats?.tempRange}</div>
                          <div className="text-gray-400 text-xs mt-1">Sea surface temperature range</div>
                        </div>
                        <div className="bg-migratewatch-panel/50 p-4 rounded-lg">
                          <div className="text-migratewatch-green text-sm font-medium mb-1">Shore Distance</div>
                          <div className="text-2xl font-bold">{stats?.avgShoreDistance} m</div>
                          <div className="text-gray-400 text-xs mt-1">Average distance from shore</div>
                        </div>
                      </div>

                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>{sections.habitat || "No habitat information available."}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Conservation Tab */}
                {activeTab === "conservation" && (
                  <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none mb-6">
                    <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                      <CardTitle className="text-xl text-white flex items-center">
                        <Shield className="mr-2 h-5 w-5 text-migratewatch-cyan" />
                        Conservation Implications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="bg-gradient-to-r from-migratewatch-magenta/20 to-migratewatch-panel/30 p-4 rounded-lg mb-6 border-l-4 border-migratewatch-magenta">
                        <h3 className="text-lg font-bold text-white mb-2">Shipping Impact Analysis</h3>
                        <p className="text-gray-300 mb-3">
                          This species creates important marine habitat and may be vulnerable to shipping traffic. The
                          data shows its preferred environmental conditions which can be used to identify areas worth
                          protecting or at risk from shipping lanes.
                        </p>
                        <div className="flex items-center">
                          <div className="bg-migratewatch-magenta/30 px-3 py-1 rounded-full text-migratewatch-magenta text-xs font-medium">
                            High Conservation Priority
                          </div>
                        </div>
                      </div>

                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>
                          {sections.conservation || "No conservation information available."}
                        </ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div>
                {/* Key Statistics Card */}
                <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none mb-6">
                  <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                    <CardTitle className="text-base text-white flex items-center">
                      <BarChart2 className="mr-2 h-4 w-4 text-migratewatch-cyan" />
                      Key Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {stats && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Observations:</span>
                          <span className="font-medium text-migratewatch-cyan">
                            {stats.totalObservations.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Depth:</span>
                          <span>{stats.avgDepth} m</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Temperature Range:</span>
                          <span>{stats.tempRange}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Average Salinity:</span>
                          <span>{stats.avgSalinity} PSU</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Observation Years:</span>
                          <span>{stats.yearRange}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Shore Distance:</span>
                          <span>{stats.avgShoreDistance} m</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Temporal Patterns Card */}
                <Card className="bg-migratewatch-panel/90 border-migratewatch-panel shadow-none mb-6">
                  <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                    <CardTitle className="text-base text-white flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-migratewatch-cyan" />
                      Temporal Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="prose prose-invert max-w-none prose-sm">
                      <ReactMarkdown>{sections.temporal || "No temporal information available."}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>

                {/* Conservation Highlights Card */}
                <Card className="bg-gradient-to-br from-migratewatch-panel/90 to-migratewatch-panel/70 border-migratewatch-panel shadow-none">
                  <CardHeader className="pb-2 border-b border-migratewatch-panel/50">
                    <CardTitle className="text-base text-white flex items-center">
                      <Shield className="mr-2 h-4 w-4 text-migratewatch-green" />
                      Conservation Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="bg-migratewatch-green/20 p-1 rounded-full mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-migratewatch-green rounded-full"></div>
                        </div>
                        <span>Creates important marine habitat for other species</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-migratewatch-green/20 p-1 rounded-full mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-migratewatch-green rounded-full"></div>
                        </div>
                        <span>Primarily found in shallow coastal waters</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-migratewatch-green/20 p-1 rounded-full mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-migratewatch-green rounded-full"></div>
                        </div>
                        <span>Potential indicator species for marine ecosystem health</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-migratewatch-magenta/20 p-1 rounded-full mr-2 mt-0.5">
                          <div className="w-1.5 h-1.5 bg-migratewatch-magenta rounded-full"></div>
                        </div>
                        <span>Vulnerable to shipping traffic in coastal areas</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

