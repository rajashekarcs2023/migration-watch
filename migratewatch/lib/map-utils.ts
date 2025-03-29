import * as THREE from "three"

// Helper function to convert lat/lng to 3D coordinates
export function latLngToVector3(lat: number, lng: number, radius = 1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)

  return new THREE.Vector3(x, y, z)
}

// Create a curved line between two points on the globe
export function createArcPoints(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  segments = 50,
  height = 0.2,
): THREE.Vector3[] {
  const start = latLngToVector3(startLat, startLng)
  const end = latLngToVector3(endLat, endLng)

  // Calculate the mid point
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)

  // Elevate the mid point
  const midLength = mid.length()
  mid.normalize().multiplyScalar(midLength + height)

  // Create a quadratic bezier curve
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)

  // Sample points along the curve
  return curve.getPoints(segments)
}

// Generate random points along a path with some variation
export function generatePathPoints(basePath: [number, number][], count = 10, variation = 2): [number, number][] {
  const points: [number, number][] = []

  for (let i = 0; i < count; i++) {
    // Pick a random segment from the base path
    const segmentIndex = Math.floor(Math.random() * (basePath.length - 1))
    const start = basePath[segmentIndex]
    const end = basePath[segmentIndex + 1]

    // Interpolate a point along this segment
    const t = Math.random()
    const lat = start[0] + (end[0] - start[0]) * t
    const lng = start[1] + (end[1] - start[1]) * t

    // Add some random variation
    const varLat = (Math.random() - 0.5) * variation
    const varLng = (Math.random() - 0.5) * variation

    points.push([lat + varLat, lng + varLng])
  }

  return points
}

// Animation timing function
export function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2
}

