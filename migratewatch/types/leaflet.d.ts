/**
 * Type definitions for Leaflet
 */

declare namespace L {
  interface MapOptions {
    center?: LatLngExpression;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    layers?: Layer[];
    maxBounds?: LatLngBoundsExpression;
    renderer?: Renderer;
    zoomControl?: boolean;
    attributionControl?: boolean;
    zoomAnimation?: boolean;
    fadeAnimation?: boolean;
    markerZoomAnimation?: boolean;
    transform3DLimit?: number;
    inertia?: boolean;
    worldCopyJump?: boolean;
    maxBoundsViscosity?: number;
    keyboard?: boolean;
    keyboardPanDelta?: number;
    scrollWheelZoom?: boolean | string;
    wheelDebounceTime?: number;
    wheelPxPerZoomLevel?: number;
    tap?: boolean;
    tapTolerance?: number;
    touchZoom?: boolean | string;
    bounceAtZoomLimits?: boolean;
    doubleClickZoom?: boolean | string;
    dragging?: boolean;
  }

  interface Map extends Evented {
    getCenter(): LatLng;
    getZoom(): number;
    setView(center: LatLngExpression, zoom?: number, options?: ZoomPanOptions): this;
    setZoom(zoom: number, options?: ZoomPanOptions): this;
    addLayer(layer: Layer): this;
    removeLayer(layer: Layer): this;
    hasLayer(layer: Layer): boolean;
    eachLayer(fn: (layer: Layer) => void, context?: any): this;
    openPopup(popup: Popup): this;
    openPopup(content: Content, latlng: LatLngExpression, options?: PopupOptions): this;
    closePopup(popup?: Popup): this;
    flyTo(latlng: LatLngExpression, zoom?: number, options?: ZoomPanOptions): this;
    flyToBounds(bounds: LatLngBoundsExpression, options?: FitBoundsOptions): this;
    fitBounds(bounds: LatLngBoundsExpression, options?: FitBoundsOptions): this;
    panTo(latlng: LatLngExpression, options?: PanOptions): this;
    invalidateSize(options?: { animate?: boolean, pan?: boolean } | boolean): this;
    setMaxBounds(bounds: LatLngBoundsExpression): this;
    locate(options?: LocateOptions): this;
    stopLocate(): this;
    remove(): this;
    getContainer(): HTMLElement;
    getSize(): Point;
    getPixelBounds(): Bounds;
    getPixelOrigin(): Point;
    getPixelWorldBounds(zoom?: number): Bounds;
    getZoomScale(toZoom: number, fromZoom?: number): number;
    getScaleZoom(scale: number, fromZoom?: number): number;
    project(latlng: LatLngExpression, zoom?: number): Point;
    unproject(point: PointExpression, zoom?: number): LatLng;
    layerPointToLatLng(point: PointExpression): LatLng;
    latLngToLayerPoint(latlng: LatLngExpression): Point;
    wrapLatLng(latlng: LatLngExpression): LatLng;
    wrapLatLngBounds(bounds: LatLngBoundsExpression): LatLngBounds;
    distance(latlng1: LatLngExpression, latlng2: LatLngExpression): number;
    containerPointToLayerPoint(point: PointExpression): Point;
    containerPointToLatLng(point: PointExpression): LatLng;
    layerPointToContainerPoint(point: PointExpression): Point;
    latLngToContainerPoint(latlng: LatLngExpression): Point;
    mouseEventToContainerPoint(ev: MouseEvent): Point;
    mouseEventToLayerPoint(ev: MouseEvent): Point;
    mouseEventToLatLng(ev: MouseEvent): LatLng;
  }

  interface Layer {
    addTo(map: Map | LayerGroup): this;
    remove(): this;
    removeFrom(map: Map): this;
    getPane(name?: string): HTMLElement | undefined;
    getAttribution(): string | null;
  }

  interface Marker extends Layer {
    getLatLng(): LatLng;
    setLatLng(latlng: LatLngExpression): this;
    setIcon(icon: Icon): this;
    setZIndexOffset(offset: number): this;
    setOpacity(opacity: number): this;
    getElement(): HTMLElement | undefined;
    bindPopup(content: Content | ((layer: Layer) => Content), options?: PopupOptions): this;
    unbindPopup(): this;
    openPopup(latlng?: LatLngExpression): this;
    getPopup(): Popup | undefined;
    closePopup(): this;
    togglePopup(): this;
    bindTooltip(content: Content | ((layer: Layer) => Content), options?: TooltipOptions): this;
    unbindTooltip(): this;
    openTooltip(latlng?: LatLngExpression): this;
    getTooltip(): Tooltip | undefined;
    closeTooltip(): this;
    toggleTooltip(): this;
  }

  interface Polyline extends Path {
    getLatLngs(): LatLng[] | LatLng[][] | LatLng[][][];
    setLatLngs(latlngs: LatLngExpression[] | LatLngExpression[][] | LatLngExpression[][][]): this;
    addLatLng(latlng: LatLngExpression | LatLngExpression[]): this;
    getCenter(): LatLng;
  }

  interface Path extends Layer {
    redraw(): this;
    setStyle(style: PathOptions): this;
    bringToFront(): this;
    bringToBack(): this;
  }

  interface LatLng {
    lat: number;
    lng: number;
    alt?: number;
    equals(otherLatLng: LatLngExpression, maxMargin?: number): boolean;
    toString(): string;
    distanceTo(otherLatLng: LatLngExpression): number;
    wrap(): LatLng;
    toBounds(sizeInMeters: number): LatLngBounds;
  }

  interface LatLngBounds {
    extend(latlngOrBounds: LatLngExpression | LatLngBoundsExpression): this;
    getSouthWest(): LatLng;
    getNorthEast(): LatLng;
    getNorth(): number;
    getSouth(): number;
    getEast(): number;
    getWest(): number;
    getCenter(): LatLng;
    contains(latlngOrBounds: LatLngExpression | LatLngBoundsExpression): boolean;
    intersects(bounds: LatLngBoundsExpression): boolean;
    overlaps(bounds: LatLngBoundsExpression): boolean;
    toBBoxString(): string;
    equals(bounds: LatLngBoundsExpression): boolean;
    isValid(): boolean;
  }

  interface Point {
    x: number;
    y: number;
    add(point: PointExpression): Point;
    subtract(point: PointExpression): Point;
    divideBy(num: number): Point;
    multiplyBy(num: number): Point;
    scaleBy(point: PointExpression): Point;
    unscaleBy(point: PointExpression): Point;
    round(): Point;
    floor(): Point;
    ceil(): Point;
    distanceTo(point: PointExpression): number;
    equals(point: PointExpression): boolean;
    contains(point: PointExpression): boolean;
    toString(): string;
  }

  interface Bounds {
    extend(point: PointExpression): this;
    getCenter(round?: boolean): Point;
    getBottomLeft(): Point;
    getBottomRight(): Point;
    getTopLeft(): Point;
    getTopRight(): Point;
    getSize(): Point;
    contains(pointOrBounds: PointExpression | Bounds): boolean;
    intersects(bounds: Bounds): boolean;
    overlaps(bounds: Bounds): boolean;
  }

  // Type aliases
  type LatLngExpression = LatLng | [number, number] | [number, number, number] | { lat: number, lng: number, alt?: number };
  type LatLngBoundsExpression = LatLngBounds | LatLngExpression[] | [[number, number], [number, number]];
  type PointExpression = Point | [number, number];
  type Content = string | HTMLElement;

  // Options interfaces
  interface ZoomPanOptions {
    animate?: boolean;
    duration?: number;
    easeLinearity?: number;
    noMoveStart?: boolean;
  }

  interface PanOptions {
    animate?: boolean;
    duration?: number;
    easeLinearity?: number;
    noMoveStart?: boolean;
  }

  interface FitBoundsOptions extends ZoomPanOptions {
    paddingTopLeft?: PointExpression;
    paddingBottomRight?: PointExpression;
    padding?: PointExpression;
    maxZoom?: number;
  }

  interface LocateOptions {
    watch?: boolean;
    setView?: boolean;
    maxZoom?: number;
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
  }

  interface PathOptions {
    stroke?: boolean;
    color?: string;
    weight?: number;
    opacity?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'miter' | 'round' | 'bevel';
    dashArray?: string | number[];
    dashOffset?: string;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    fillRule?: 'nonzero' | 'evenodd';
    interactive?: boolean;
    bubblingMouseEvents?: boolean;
  }

  interface PopupOptions {
    maxWidth?: number;
    minWidth?: number;
    maxHeight?: number;
    autoPan?: boolean;
    autoPanPaddingTopLeft?: PointExpression;
    autoPanPaddingBottomRight?: PointExpression;
    autoPanPadding?: PointExpression;
    keepInView?: boolean;
    closeButton?: boolean;
    autoClose?: boolean;
    closeOnEscapeKey?: boolean;
    closeOnClick?: boolean;
    className?: string;
  }

  interface TooltipOptions {
    pane?: string;
    offset?: PointExpression;
    direction?: 'right' | 'left' | 'top' | 'bottom' | 'center' | 'auto';
    permanent?: boolean;
    sticky?: boolean;
    interactive?: boolean;
    opacity?: number;
    className?: string;
  }

  // Event interfaces
  interface Evented {
    on(type: string, fn: (e: any) => void, context?: any): this;
    once(type: string, fn: (e: any) => void, context?: any): this;
    off(type: string, fn?: (e: any) => void, context?: any): this;
    fire(type: string, data?: any, propagate?: boolean): this;
    listens(type: string): boolean;
  }

  // Factory functions
  function map(element: string | HTMLElement, options?: MapOptions): Map;
  function marker(latlng: LatLngExpression, options?: MarkerOptions): Marker;
  function polyline(latlngs: LatLngExpression[] | LatLngExpression[][], options?: PolylineOptions): Polyline;
  function polygon(latlngs: LatLngExpression[] | LatLngExpression[][] | LatLngExpression[][][], options?: PolylineOptions): Polygon;
  function circle(latlng: LatLngExpression, options?: CircleOptions): Circle;
  function rectangle(bounds: LatLngBoundsExpression, options?: PolylineOptions): Rectangle;
  function latLng(latitude: number, longitude: number, altitude?: number): LatLng;
  function latLngBounds(southWest: LatLngExpression, northEast: LatLngExpression): LatLngBounds;
  function point(x: number, y: number, round?: boolean): Point;
  function bounds(topLeft: PointExpression, bottomRight: PointExpression): Bounds;
  function icon(options: IconOptions): Icon;
  function divIcon(options: DivIconOptions): DivIcon;
  function tileLayer(urlTemplate: string, options?: TileLayerOptions): TileLayer;
  function layerGroup(layers?: Layer[]): LayerGroup;
  function featureGroup(layers?: Layer[]): FeatureGroup;
  function geoJSON(geojson?: any, options?: GeoJSONOptions): GeoJSON;
  function control(options?: ControlOptions): Control;
}

declare module 'leaflet' {
  export = L;
}
