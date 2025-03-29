export interface SpeciesData {
  id: string
  name: string
  selected: boolean
}

export interface TimelineData {
  currentPeriod: string
  position: number
}

export interface DataLayers {
  migrationRoutes: boolean
  shippingLanes: boolean
  conflictZones: boolean
  seaTemperature: boolean
}

export interface ConflictAnalysis {
  species: string
  period: string
  highRiskAreas: number
  collisionRiskReduction: number
  avgRouteDeviation: number
  recommendedAction: string
}

export interface RouteOptimization {
  name: string
  risk: number
  color: string
}

