export const TRIP_GAP_DEFAULT_SECONDS = 600
export const MIN_TRIP_POINTS = 5
export const MIN_TRIP_DISTANCE = 50
export const SPEED_STOP_KMH = 2
export const MAX_IMPLIED_SPEED_KMH = 500

export const SPEED_COLOR_STOPS: [number, string][] = [
  [0, '#3fb950'],
  [20, '#56d364'],
  [40, '#e3b341'],
  [60, '#d29922'],
  [80, '#db6d28'],
  [100, '#f85149'],
  [120, '#bc4a9b'],
  [140, '#8b5cf6'],
]

export const SPEED_COLOR_EXPRESSION = [
  'interpolate',
  ['linear'],
  ['get', 'speed'],
  ...SPEED_COLOR_STOPS.flat(),
]

export type BasemapKey = 'dark' | 'light' | 'voyager' | 'vector' | 'topo' | 'satellite'

export const BASEMAP_STYLES: Record<BasemapKey, string | object> = {
  dark: {
    version: 8,
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '&copy; CARTO &copy; OSM',
      },
    },
    layers: [{ id: 'carto-dark', type: 'raster', source: 'carto-dark' }],
  },
  light: {
    version: 8,
    sources: {
      'carto-light': {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '&copy; CARTO &copy; OSM',
      },
    },
    layers: [{ id: 'carto-light', type: 'raster', source: 'carto-light' }],
  },
  voyager: {
    version: 8,
    sources: {
      'carto-voyager': {
        type: 'raster',
        tiles: ['https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'],
        tileSize: 256,
        attribution: '&copy; CARTO &copy; OSM',
      },
    },
    layers: [{ id: 'carto-voyager', type: 'raster', source: 'carto-voyager' }],
  },
  vector: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap',
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  },
  topo: {
    version: 8,
    sources: {
      opentopomap: {
        type: 'raster',
        tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenTopoMap &copy; OSM',
      },
    },
    layers: [{ id: 'opentopomap', type: 'raster', source: 'opentopomap' }],
  },
  satellite: {
    version: 8,
    sources: {
      'esri-imagery': {
        type: 'raster',
        tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
        attribution: '&copy; Esri',
      },
      'esri-reference': {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
      },
    },
    layers: [
      { id: 'esri-imagery', type: 'raster', source: 'esri-imagery' },
      { id: 'esri-reference', type: 'raster', source: 'esri-reference' },
    ],
  },
}
