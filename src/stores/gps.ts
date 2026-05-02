import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { TripSummary, ParseProgress } from '../types'
import type { ColumnarData } from '../utils/parser'
import type { FeatureCollection } from 'geojson'
import { tripToSpeedGeoJSON, tripToOverviewGeoJSON, tripEndpoints } from '../utils/geojson'

export const useGpsStore = defineStore('gps', () => {
  const summaries = ref<TripSummary[]>([])
  const selectedTripId = ref<string | null>(null)
  const activeTripGeoJSON = shallowRef<FeatureCollection | null>(null)
  const activeEndpoints = shallowRef<FeatureCollection | null>(null)
  const overviewGeoJSON = shallowRef<FeatureCollection | null>(null)
  const columnar = shallowRef<ColumnarData | null>(null)
  const isParsing = ref(false)
  const parseProgress = ref<ParseProgress | null>(null)
  const error = ref<string | null>(null)
  const fileStats = ref<{
    totalRecords: number
    skippedRecords: number
    segmentCount: number
    fileSize: number
    fileName: string
  } | null>(null)

  let worker: Worker | null = null

  function loadFile(file: File, gapSeconds = 600) {
    if (worker) worker.terminate()
    isParsing.value = true
    error.value = null
    parseProgress.value = { phase: 'reading', progress: 0, recordsProcessed: 0, message: '正在读取文件...' }

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      worker = new Worker(new URL('../workers/gps-parser.worker.ts', import.meta.url), { type: 'module' })

      worker.onmessage = (e) => {
        const msg = e.data
        if (msg.type === 'progress') {
          parseProgress.value = msg.data
        } else if (msg.type === 'result') {
          summaries.value = msg.data.summaries
          columnar.value = msg.data.columnar
          fileStats.value = msg.data.stats
          isParsing.value = false
          parseProgress.value = { phase: 'done', progress: 100, recordsProcessed: msg.data.stats.totalRecords, message: '解析完成' }
          buildOverview()
          worker = null
        } else if (msg.type === 'error') {
          error.value = msg.data.message
          isParsing.value = false
          worker = null
        }
      }

      worker.postMessage({ text, fileName: file.name, fileSize: file.size, gapSeconds })
    }

    reader.onerror = () => {
      error.value = '文件读取失败'
      isParsing.value = false
    }

    reader.readAsText(file)
  }

  function selectTrip(tripId: string | null) {
    selectedTripId.value = tripId
    if (!tripId || !columnar.value) {
      activeTripGeoJSON.value = null
      activeEndpoints.value = null
      return
    }

    const trip = summaries.value.find(s => s.id === tripId)
    if (!trip) return

    const { timestamps, lats, lons, speeds, rawSpeeds, accels, signals, sats } = columnar.value
    const start = trip.startRecordIndex
    const len = trip.recordCount_
    const records = []
    for (let i = start; i < start + len; i++) {
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

    activeTripGeoJSON.value = tripToSpeedGeoJSON(records)
    activeEndpoints.value = tripEndpoints(records)
  }

  function buildOverview() {
    if (!columnar.value || summaries.value.length === 0) {
      overviewGeoJSON.value = null
      return
    }

    const { timestamps, lats, lons, speeds, rawSpeeds, accels, signals, sats } = columnar.value
    const features: FeatureCollection['features'] = []

    for (const trip of summaries.value) {
      const records = []
      const start = trip.startRecordIndex
      for (let i = start; i < start + trip.recordCount_; i++) {
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
      const fc = tripToOverviewGeoJSON(records, 0.0002)
      features.push(...fc.features)
    }

    overviewGeoJSON.value = { type: 'FeatureCollection', features }
  }

  function clearAll() {
    summaries.value = []
    selectedTripId.value = null
    activeTripGeoJSON.value = null
    activeEndpoints.value = null
    overviewGeoJSON.value = null
    columnar.value = null
    fileStats.value = null
    error.value = null
    if (worker) { worker.terminate(); worker = null }
  }

  return {
    summaries, selectedTripId, activeTripGeoJSON, activeEndpoints,
    overviewGeoJSON, columnar, isParsing, parseProgress, error, fileStats,
    loadFile, selectTrip, clearAll, buildOverview,
  }
})
