import type { RawRecord } from '../types'
import { SPEED_STOP_KMH } from './constants'

export function speedToKmh(rawSpeed: number): number {
  return rawSpeed * 0.01 * 3.6
}

export function computeTripStats(records: RawRecord[]): {
  distance: number
  maxSpeed: number
  avgSpeed: number
  bounds: { west: number; south: number; east: number; north: number }
} {
  let distance = 0
  let maxSpeed = 0
  let movingTime = 0
  let movingDist = 0
  let minLat = Infinity, maxLat = -Infinity
  let minLon = Infinity, maxLon = -Infinity

  for (let i = 0; i < records.length; i++) {
    const r = records[i]
    const kmh = speedToKmh(r.speed)
    if (kmh > maxSpeed) maxSpeed = kmh

    if (r.lat < minLat) minLat = r.lat
    if (r.lat > maxLat) maxLat = r.lat
    if (r.lon < minLon) minLon = r.lon
    if (r.lon > maxLon) maxLon = r.lon

    if (i > 0) {
      const d = haversine(records[i - 1].lat, records[i - 1].lon, r.lat, r.lon)
      distance += d
      if (kmh > SPEED_STOP_KMH) {
        movingDist += d
        movingTime += (r.timestamp - records[i - 1].timestamp)
      }
    }
  }

  return {
    distance,
    maxSpeed,
    avgSpeed: movingTime > 0 ? (movingDist / movingTime * 3.6) : 0,
    bounds: { west: minLon, south: minLat, east: maxLon, north: maxLat },
  }
}

export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
