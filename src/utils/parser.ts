import type { RawRecord, TripSummary } from '../types'
import { computeTripStats } from './speed'
import { TRIP_GAP_DEFAULT_SECONDS, MIN_TRIP_POINTS } from './constants'
import { formatTime, formatDateKey } from './format'

export interface ColumnarData {
  timestamps: Float64Array
  lats: Float64Array
  lons: Float64Array
  speeds: Float64Array
  rawSpeeds: Float64Array
  accels: Float32Array
  signals: Float32Array
  sats: Float32Array
  count: number
}

export function parseRaw(text: string): { data: ColumnarData; skipped: number; segments: number } {
  const lines = text.split('\n')
  const maxLen = lines.length

  const timestamps = new Float64Array(maxLen)
  const lats = new Float64Array(maxLen)
  const lons = new Float64Array(maxLen)
  const speeds = new Float64Array(maxLen)
  const rawSpeeds = new Float64Array(maxLen)
  const accels = new Float32Array(maxLen)
  const signals = new Float32Array(maxLen)
  const sats = new Float32Array(maxLen)

  let count = 0
  let skipped = 0
  let segments = 0
  let prevTs = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    if (line === '$V02') {
      segments++
      continue
    }

    const parts = line.split(',')
    if (parts.length !== 13) { skipped++; continue }
    if (parts[1] !== 'A') { skipped++; continue }
    if (parts[2] === '0.000000' || parts[3] === '0.000000') { skipped++; continue }

    const ts = parseInt(parts[0], 10)
    if (ts <= prevTs) { skipped++; continue }

    timestamps[count] = ts
    lats[count] = parseFloat(parts[2])
    lons[count] = parseFloat(parts[3])
    speeds[count] = parseFloat(parts[5])
    rawSpeeds[count] = parseFloat(parts[4])
    accels[count] = parseFloat(parts[6])
    signals[count] = parseFloat(parts[7])
    sats[count] = parseFloat(parts[8])

    prevTs = ts
    count++
  }

  return {
    data: {
      timestamps: timestamps.slice(0, count),
      lats: lats.slice(0, count),
      lons: lons.slice(0, count),
      speeds: speeds.slice(0, count),
      rawSpeeds: rawSpeeds.slice(0, count),
      accels: accels.slice(0, count),
      signals: signals.slice(0, count),
      sats: sats.slice(0, count),
      count,
    },
    skipped,
    segments,
  }
}

export function detectTrips(
  data: ColumnarData,
  gapSeconds = TRIP_GAP_DEFAULT_SECONDS,
): TripSummary[] {
  const { timestamps, lats, lons, speeds, rawSpeeds, accels, signals, sats, count } = data
  const trips: TripSummary[] = []
  let tripStart = 0

  function finalizeTrip(end: number) {
    const len = end - tripStart
    if (len < MIN_TRIP_POINTS) return

    const records: RawRecord[] = []
    for (let i = tripStart; i < end; i++) {
      records.push({
        timestamp: timestamps[i],
        lat: lats[i],
        lon: lons[i],
        speed: speeds[i],
        rawSpeed: rawSpeeds[i],
        accel: accels[i],
        signal: signals[i],
        satellites: sats[i],
      })
    }

    const stats = computeTripStats(records)
    const startTs = timestamps[tripStart]
    const endTs = timestamps[end - 1]

    trips.push({
      id: `trip-${startTs}`,
      startTime: startTs,
      endTime: endTs,
      startLat: lats[tripStart],
      startLon: lons[tripStart],
      endLat: lats[end - 1],
      endLon: lons[end - 1],
      duration: endTs - startTs,
      distance: stats.distance,
      maxSpeed: stats.maxSpeed,
      avgSpeed: stats.avgSpeed,
      dateLabel: formatDateKey(startTs),
      timeLabel: `${formatTime(startTs)} ~ ${formatTime(endTs)}`,
      recordCount: len,
      startRecordIndex: tripStart,
      recordCount_: len,
      bounds: stats.bounds,
    })
  }

  for (let i = 1; i < count; i++) {
    const gap = timestamps[i] - timestamps[i - 1]
    if (gap > gapSeconds) {
      finalizeTrip(i)
      tripStart = i
    }
  }
  finalizeTrip(count)

  return trips
}
