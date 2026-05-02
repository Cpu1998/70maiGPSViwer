import type { RawRecord } from '../types'
import type { FeatureCollection, Feature, LineString, Point } from 'geojson'
import { speedToKmh } from './speed'
import { SPEED_COLOR_STOPS } from './constants'

function speedBucket(kmh: number): number {
  for (let i = SPEED_COLOR_STOPS.length - 1; i >= 0; i--) {
    if (kmh >= SPEED_COLOR_STOPS[i][0]) return SPEED_COLOR_STOPS[i][0]
  }
  return 0
}

export function tripToSpeedGeoJSON(records: RawRecord[]): FeatureCollection {
  if (records.length < 2) return { type: 'FeatureCollection', features: [] }

  const features: Feature[] = []
  let currentBucket = -1
  let currentCoords: number[][] = []

  for (let i = 0; i < records.length; i++) {
    const kmh = speedToKmh(records[i].speed)
    const bucket = speedBucket(kmh)

    if (bucket !== currentBucket && currentCoords.length >= 2) {
      features.push(makeSegment(currentCoords, currentBucket))
      currentCoords = [currentCoords[currentCoords.length - 1]]
    }

    currentCoords.push([records[i].lon, records[i].lat])
    currentBucket = bucket
  }

  if (currentCoords.length >= 2) {
    features.push(makeSegment(currentCoords, currentBucket))
  }

  return { type: 'FeatureCollection', features }
}

function makeSegment(coords: number[][], bucket: number): Feature<LineString> {
  return {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: coords },
    properties: { speed: bucket },
  }
}

export function tripToOverviewGeoJSON(records: RawRecord[], tolerance = 0.00005): FeatureCollection {
  const coords = records.map(r => [r.lon, r.lat] as [number, number])
  const simplified = douglasPeucker(coords, tolerance)
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: simplified },
      properties: {},
    }],
  }
}

export function tripEndpoints(records: RawRecord[]): FeatureCollection {
  if (records.length === 0) return { type: 'FeatureCollection', features: [] }
  const features: Feature<Point>[] = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [records[0].lon, records[0].lat] },
      properties: { type: 'start' },
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [records[records.length - 1].lon, records[records.length - 1].lat] },
      properties: { type: 'end' },
    },
  ]
  return { type: 'FeatureCollection', features }
}

function douglasPeucker(coords: [number, number][], tolerance: number): [number, number][] {
  if (coords.length <= 2) return coords

  let maxDist = 0
  let maxIdx = 0
  const start = coords[0]
  const end = coords[coords.length - 1]

  for (let i = 1; i < coords.length - 1; i++) {
    const d = perpDist(coords[i], start, end)
    if (d > maxDist) {
      maxDist = d
      maxIdx = i
    }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(coords.slice(0, maxIdx + 1), tolerance)
    const right = douglasPeucker(coords.slice(maxIdx), tolerance)
    return [...left.slice(0, -1), ...right]
  }

  return [start, end]
}

function perpDist(p: [number, number], a: [number, number], b: [number, number]): number {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((p[0] - a[0]) ** 2 + (p[1] - a[1]) ** 2)
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq))
  const projX = a[0] + t * dx
  const projY = a[1] + t * dy
  return Math.sqrt((p[0] - projX) ** 2 + (p[1] - projY) ** 2)
}
