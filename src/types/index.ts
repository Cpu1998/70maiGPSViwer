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

export const SPEED_STOP_KMH = 2
