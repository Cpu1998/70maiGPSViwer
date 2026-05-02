export const TRIP_GAP_DEFAULT_SECONDS = 600
export const MIN_TRIP_POINTS = 5
export const MIN_TRIP_DISTANCE = 50
export const SPEED_STOP_KMH = 2

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

export const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/standard'
