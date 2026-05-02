import type { RawRecord, TripSummary } from '../types'
import { computeTripStats, haversine } from './speed'
import { TRIP_GAP_DEFAULT_SECONDS, MIN_TRIP_POINTS, MAX_IMPLIED_SPEED_KMH } from './constants'
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

export function filterOutliers(data: ColumnarData): ColumnarData {
  const { timestamps, lats, lons, speeds, rawSpeeds, accels, signals, sats, count } = data
  if (count < 3) return data

  const valid = new Uint8Array(count)
  valid[0] = 1
  let lastValid = 0
  let removed = 0

  for (let i = 1; i < count; i++) {
    const dt = timestamps[i] - timestamps[lastValid]
    if (dt <= 0) { removed++; continue }

    const dist = haversine(lats[lastValid], lons[lastValid], lats[i], lons[i])
    const impliedKmh = (dist / dt) * 3.6

    if (impliedKmh > MAX_IMPLIED_SPEED_KMH) {
      // Check if i+1 is also far from lastValid — if so, this is a legitimate position shift
      const next = i + 1
      if (next < count) {
        const dt2 = timestamps[next] - timestamps[lastValid]
        if (dt2 > 0) {
          const dist2 = haversine(lats[lastValid], lons[lastValid], lats[next], lons[next])
          if ((dist2 / dt2) * 3.6 > MAX_IMPLIED_SPEED_KMH) {
            valid[i] = 1
            lastValid = i
            continue
          }
        }
      }
      removed++
    } else {
      valid[i] = 1
      lastValid = i
    }
  }

  if (removed === 0) return data

  const out = {
    timestamps: new Float64Array(count - removed),
    lats: new Float64Array(count - removed),
    lons: new Float64Array(count - removed),
    speeds: new Float64Array(count - removed),
    rawSpeeds: new Float64Array(count - removed),
    accels: new Float32Array(count - removed),
    signals: new Float32Array(count - removed),
    sats: new Float32Array(count - removed),
    count: count - removed,
  }

  let j = 0
  for (let i = 0; i < count; i++) {
    if (!valid[i]) continue
    out.timestamps[j] = timestamps[i]
    out.lats[j] = lats[i]
    out.lons[j] = lons[i]
    out.speeds[j] = speeds[i]
    out.rawSpeeds[j] = rawSpeeds[i]
    out.accels[j] = accels[i]
    out.signals[j] = signals[i]
    out.sats[j] = sats[i]
    j++
  }

  return out
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
