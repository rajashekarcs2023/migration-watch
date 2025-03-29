/**
 * Type definitions for Cesium
 */

declare namespace Cesium {
  // Core types
  interface Viewer {
    scene: Scene;
    camera: Camera;
    clock: Clock;
    entities: EntityCollection;
    timeline: Timeline;
    destroy(): void;
  }

  interface Scene {
    globe: Globe;
    fog: Fog;
    requestRenderMode: boolean;
    maximumRenderTimeChange: number;
  }

  interface Globe {
    enableLighting: boolean;
    depthTestAgainstTerrain: boolean;
  }

  interface Camera {
    flyTo(options: CameraFlyToOptions): Promise<void>;
    setView(options: CameraViewOptions): void;
  }

  interface CameraFlyToOptions {
    destination?: Cartesian3;
    orientation?: CameraOrientation;
    duration?: number;
    complete?: () => void;
    cancel?: () => void;
  }

  interface CameraViewOptions {
    destination: Cartesian3;
    orientation?: CameraOrientation;
  }

  interface CameraOrientation {
    heading?: number;
    pitch?: number;
    roll?: number;
  }

  interface Clock {
    startTime: JulianDate;
    stopTime: JulianDate;
    currentTime: JulianDate;
    multiplier: number;
    clockRange: ClockRange;
    clockStep: ClockStep;
    shouldAnimate: boolean;
  }

  interface Timeline {
    zoomTo(startTime: JulianDate, stopTime: JulianDate): void;
  }

  // Entity types
  interface EntityCollection {
    add(entity: Entity): Entity;
    remove(entity: Entity): boolean;
    removeAll(): void;
    getById(id: string): Entity | undefined;
  }

  interface Entity {
    id: string;
    name?: string;
    position?: PositionProperty;
    orientation?: Property;
    billboard?: BillboardGraphics;
    box?: BoxGraphics;
    corridor?: CorridorGraphics;
    cylinder?: CylinderGraphics;
    ellipse?: EllipseGraphics;
    ellipsoid?: EllipsoidGraphics;
    label?: LabelGraphics;
    model?: ModelGraphics;
    path?: PathGraphics;
    plane?: PlaneGraphics;
    point?: PointGraphics;
    polygon?: PolygonGraphics;
    polyline?: PolylineGraphics;
    polylineVolume?: PolylineVolumeGraphics;
    rectangle?: RectangleGraphics;
    wall?: WallGraphics;
  }

  interface PointGraphics {
    pixelSize?: number | Property;
    color?: Color | Property;
    outlineColor?: Color | Property;
    outlineWidth?: number | Property;
  }

  interface PathGraphics {
    material?: MaterialProperty;
    width?: number | Property;
    leadTime?: number | Property;
    trailTime?: number | Property;
    resolution?: number | Property;
  }

  interface PolylineGraphics {
    positions?: Cartesian3[] | Property;
    width?: number | Property;
    material?: MaterialProperty;
    clampToGround?: boolean | Property;
  }

  // Primitive types
  interface Primitive {
    show: boolean;
    update(): void;
    destroy(): void;
  }

  // Position types
  interface Cartesian3 {
    x: number;
    y: number;
    z: number;
  }

  interface Cartographic {
    longitude: number;
    latitude: number;
    height: number;
  }

  // Property types
  interface Property {
    getValue(time: JulianDate, result?: any): any;
  }
  
  namespace Property {
    function getValueOrUndefined(property: Property | undefined, time: JulianDate, result?: any): any;
    function equals(left: Property | undefined, right: Property | undefined): boolean;
  }

  interface PositionProperty extends Property {
    referenceFrame: ReferenceFrame;
  }

  interface MaterialProperty extends Property {}
  
  interface ColorMaterialProperty extends MaterialProperty {}
  
  interface PolylineDashMaterialProperty extends MaterialProperty {}
  
  interface PolylineGlowMaterialProperty extends MaterialProperty {}
  
  interface PolylineTrailMaterialProperty extends MaterialProperty {
    color: Color | Property;
    trailLength: number;
    period: number;
  }

  // Time types
  interface JulianDate {
    dayNumber: number;
    secondsOfDay: number;
  }

  // Enum types
  enum ClockRange {
    UNBOUNDED,
    CLAMPED,
    LOOP_STOP
  }

  enum ClockStep {
    TICK_DEPENDENT,
    SYSTEM_CLOCK_MULTIPLIER,
    SYSTEM_CLOCK
  }

  enum ReferenceFrame {
    FIXED,
    INERTIAL
  }

  // Other types
  interface Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  }

  interface Fog {
    enabled: boolean;
    density: number;
  }
  
  interface Rectangle {
    west: number;
    south: number;
    east: number;
    north: number;
  }
  
  interface Material {
    type: string;
  }
  
  namespace Material {
    const _materialCache: {
      hasOwnProperty(name: string): boolean;
      addMaterial(name: string, material: any): void;
    };
  }

  // Static functions
  function createWorldTerrain(options?: any): any;
  function createOsmBuildings(options?: any): any;
  function defined(value: any): boolean;
  
  // JulianDate static methods
  namespace JulianDate {
    function fromDate(date: Date): JulianDate;
    function now(): JulianDate;
    function secondsDifference(left: JulianDate, right: JulianDate): number;
  }
  
  // Rectangle static methods
  namespace Rectangle {
    function fromDegrees(west: number, south: number, east: number, north: number): Rectangle;
  }
  
  // Math namespace
  namespace Math {
    function toRadians(degrees: number): number;
  }
}

declare module '@cesium/engine' {
  export class Viewer implements Cesium.Viewer {}
  export class Scene implements Cesium.Scene {}
  export class Camera implements Cesium.Camera {}
  export class Entity implements Cesium.Entity {}
  export class Cartesian3 implements Cesium.Cartesian3 {
    static fromDegrees(longitude: number, latitude: number, height?: number): Cesium.Cartesian3;
  }
  export class Cartographic implements Cesium.Cartographic {
    static fromDegrees(longitude: number, latitude: number, height?: number): Cesium.Cartographic;
  }
  export class JulianDate implements Cesium.JulianDate {
    static fromDate(date: Date): Cesium.JulianDate;
    static now(): Cesium.JulianDate;
    static secondsDifference(left: Cesium.JulianDate, right: Cesium.JulianDate): number;
  }
  export const ClockRange: typeof Cesium.ClockRange;
  export const ClockStep: typeof Cesium.ClockStep;
  export const ReferenceFrame: typeof Cesium.ReferenceFrame;
  export function createWorldTerrain(options?: any): any;
  export function createOsmBuildings(options?: any): any;
  export function defined(value: any): boolean;
  export class Color implements Cesium.Color {
    static fromCssColorString(color: string): Cesium.Color;
  }
  export class Ion {
    static defaultAccessToken: string;
  }
  export class Rectangle implements Cesium.Rectangle {
    static fromDegrees(west: number, south: number, east: number, north: number): Cesium.Rectangle;
  }
  export class Math {
    static toRadians(degrees: number): number;
  }
  export class ColorMaterialProperty implements Cesium.ColorMaterialProperty {
    constructor(color: Cesium.Color);
  }
  export class PolylineDashMaterialProperty implements Cesium.PolylineDashMaterialProperty {
    constructor(options: { color: Cesium.Color; dashLength: number });
  }
  export class PolylineGlowMaterialProperty implements Cesium.PolylineGlowMaterialProperty {
    constructor(options: { color: Cesium.Color; glowPower: number });
  }
  export class Property {
    static getValueOrUndefined(property: Cesium.Property | undefined, time: Cesium.JulianDate, result?: any): any;
    static equals(left: Cesium.Property | undefined, right: Cesium.Property | undefined): boolean;
  }
  export class Material implements Cesium.Material {
    static _materialCache: {
      hasOwnProperty(name: string): boolean;
      addMaterial(name: string, material: any): void;
    };
  }
}

declare module '@cesium/widgets' {
  export class Viewer implements Cesium.Viewer {}
  export class Timeline implements Cesium.Timeline {}
}
