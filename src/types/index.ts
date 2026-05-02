export interface RawRecord {
  timestamp: number
  lat: number
  lon: number
  speed: number       // corrected speed in 0.01 m/s
  rawSpeed: number    // raw speed (firmware bug)
  accel: number
  signal: number
  satellites: number
}

export interface TripSummary {
  id: string
  startTime: number
  endTime: number
  startLat: number
  startLon: number
  endLat: number
  endLon: number
  duration: number
  distance: number
  maxSpeed: number
  avgSpeed: number
  dateLabel: string
  timeLabel: string
  recordCount: number
  startRecordIndex: number
  recordCount_: number
  bounds: { west: number; south: number; east: number; north: number }
}

export interface ParseProgress {
  phase: 'reading' | 'parsing' | 'detecting-trips' | 'building-geojson' | 'done'
  progress: number
  recordsProcessed: number
  message: string
}

export interface ParseResult {
  summaries: TripSummary[]
  stats: {
    totalRecords: number
    skippedRecords: number
    segmentCount: number
    fileSize: number
    fileName: string
  }
}

export interface TripFilter {
  dateStart: string
  dateEnd: string
  minDistance: number
  maxDistance: number
  minDuration: number
  maxDuration: number
  minMaxSpeed: number
  maxMaxSpeed: number
}

export type SortField = 'time' | 'distance' | 'maxSpeed' | 'avgSpeed' | 'duration'
export type SortDir = 'asc' | 'desc'

export interface TripSort {
  field: SortField
  dir: SortDir
}

export const DEFAULT_FILTER: TripFilter = {
  dateStart: '',
  dateEnd: '',
  minDistance: 0,
  maxDistance: 0,
  minDuration: 0,
  maxDuration: 0,
  minMaxSpeed: 0,
  maxMaxSpeed: 0,
}

export const DEFAULT_SORT: TripSort = {
  field: 'time',
  dir: 'asc',
}

export const SPEED_STOP_KMH = 2
