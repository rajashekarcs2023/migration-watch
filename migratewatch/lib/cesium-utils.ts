import * as Cesium from "cesium"

// Initialize Cesium with your access token
// You'll need to sign up at https://cesium.com/ion/signup/ to get a token
export function initCesium() {
  // Replace with your actual Cesium Ion access token
  Cesium.Ion.defaultAccessToken =
    ""
}

// Convert lat/lng to Cesium Cartesian3
export function fromLatLng(lat: number, lng: number, height = 0): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(lng, lat, height)
}

// Create a flowing line material for migration routes
export function createMigrationMaterial(color: Cesium.Color): Cesium.PolylineTrailMaterialProperty {
  return new Cesium.PolylineTrailMaterialProperty({
    color: color,
    trailLength: 0.8,
    period: 3.0,
  })
}

// Create a shipping lane material
export function createShippingMaterial(color: Cesium.Color): Cesium.PolylineDashMaterialProperty {
  return new Cesium.PolylineDashMaterialProperty({
    color: color,
    dashLength: 16.0,
  })
}

// Create a conflict zone material
export function createConflictMaterial(color: Cesium.Color): Cesium.ColorMaterialProperty {
  return new Cesium.ColorMaterialProperty(color)
}

// Zoom to a specific region
export function zoomToRegion(
  viewer: Cesium.Viewer,
  west: number,
  south: number,
  east: number,
  north: number,
  duration = 3.0,
): Promise<void> {
  return new Promise((resolve) => {
    viewer.camera.flyTo({
      destination: Cesium.Rectangle.fromDegrees(west, south, east, north),
      duration: duration,
      complete: () => resolve(),
    })
  })
}

// Zoom to a specific position
export function zoomToPosition(
  viewer: Cesium.Viewer,
  lat: number,
  lng: number,
  height = 1000000,
  heading = 0,
  pitch = -45,
  duration = 3.0,
): Promise<void> {
  return new Promise((resolve) => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(heading),
        pitch: Cesium.Math.toRadians(pitch),
        roll: 0.0,
      },
      duration: duration,
      complete: () => resolve(),
    })
  })
}

// Create a path emitter for particle systems
export function createPathEmitter(coordinates: number[]): Cesium.PathEmitter {
  const positions = []
  for (let i = 0; i < coordinates.length; i += 2) {
    positions.push(
      Cesium.Cartesian3.fromDegrees(
        coordinates[i + 1], // lng
        coordinates[i], // lat
        1000, // height
      ),
    )
  }

  return new Cesium.PathEmitter(positions)
}

