import * as Cesium from "cesium"

// Custom PolylineTrailMaterialProperty implementation
class PolylineTrailMaterialProperty {
  private _color: Cesium.Color | Cesium.Property
  private _trailLength: number
  private _period: number
  private _time: Cesium.JulianDate

  constructor(options: {
    color: Cesium.Color
    trailLength?: number
    period?: number
  }) {
    this._color = options.color
    this._trailLength = options.trailLength || 0.8
    this._period = options.period || 3.0
    this._time = Cesium.JulianDate.now()
  }

  get color() {
    return this._color
  }

  get trailLength() {
    return this._trailLength
  }

  get period() {
    return this._period
  }

  getType() {
    return 'PolylineTrail'
  }

  getValue(time: Cesium.JulianDate, result: any) {
    if (!result) {
      result = {}
    }

    // @ts-ignore - Property.getValueOrUndefined is available at runtime
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.trailLength = this._trailLength
    result.period = this._period
    result.time = Cesium.JulianDate.secondsDifference(time, this._time)

    return result
  }

  equals(other: any) {
    return (
      this === other ||
      (other instanceof PolylineTrailMaterialProperty &&
        // @ts-ignore - Property.equals is available at runtime
        Cesium.Property.equals(this._color, other._color) &&
        this._trailLength === other._trailLength &&
        this._period === other._period)
    )
  }
}

// Initialize Cesium with your access token
// You'll need to sign up at https://cesium.com/ion/signup/ to get a token
export function initCesium() {
  // Use environment variable or a default placeholder
  Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_TOKEN || 'YOUR_TOKEN_PLACEHOLDER';
  
  // Register the custom material
  registerPolylineTrailMaterial()
}

// Register the custom PolylineTrail material with Cesium
function registerPolylineTrailMaterial() {
  // @ts-ignore - Accessing Cesium's internal Material namespace
  if (Cesium.Material && !Cesium.Material._materialCache.hasOwnProperty('PolylineTrail')) {
    // @ts-ignore - Accessing Cesium's internal Material namespace
    Cesium.Material._materialCache.addMaterial('PolylineTrail', {
      fabric: {
        type: 'PolylineTrail',
        uniforms: {
          color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
          trailLength: 0.8,
          period: 3.0,
          time: 0
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            float time = fract(time / period);
            float trailPosition = fract(materialInput.st.s - time);
            if (trailPosition > trailLength) {
              material.alpha = 0.0;
            } else {
              material.alpha = color.a * (1.0 - trailPosition / trailLength);
            }
            material.diffuse = color.rgb;
            return material;
          }
        `
      },
      translucent: function() {
        return true;
      }
    });
  }
}

// Convert lat/lng to Cesium Cartesian3
export function fromLatLng(lat: number, lng: number, height = 0): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(lng, lat, height)
}

// Create a flowing line material for migration routes
export function createMigrationMaterial(color: Cesium.Color): any {
  return new PolylineTrailMaterialProperty({
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
