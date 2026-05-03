<script setup lang="ts">
import { ref, watch, toRef, computed } from 'vue'
import mapboxgl from 'mapbox-gl'
import type { MapMouseEvent } from 'mapbox-gl'
import { useMap } from '../composables/useMap'
import { useTripLayers } from '../composables/useTripLayers'
import { useGpsStore } from '../stores/gps'
import type { BasemapKey } from '../utils/constants'
import { formatDistance, formatDuration } from '../utils/format'
import SpeedLegend from './SpeedLegend.vue'

const props = defineProps<{ sidebarOpen?: boolean }>()
const isMobile = window.innerWidth < 768
const showBasemap = computed(() => !(isMobile && props.sidebarOpen))

const container = ref<HTMLElement | null>(null)

const { map, loaded, currentBasemap, setBasemap, fitBounds } = useMap(container)

const store = useGpsStore()

useTripLayers(
  map,
  loaded,
  toRef(store, 'overviewGeoJSON'),
  toRef(store, 'activeTripGeoJSON'),
  toRef(store, 'activeEndpoints'),
  toRef(store, 'selectedTripId'),
)

// Click on map line to select trip
let popup: mapboxgl.Popup | null = null

watch(map, (m) => {
  if (!m) return
  m.on('click', (e: MapMouseEvent) => {
    const features = m.queryRenderedFeatures(e.point, {
      layers: ['overview-hit', 'active-hit'],
    })
    if (features.length === 0) return

    const seen = new Set<string>()
    const tripIds: string[] = []
    for (const f of features) {
      const id = f.properties?.tripId as string | undefined
      if (id && !seen.has(id)) { seen.add(id); tripIds.push(id) }
    }
    if (tripIds.length === 0) return

    if (tripIds.length === 1) {
      store.selectTrip(tripIds[0])
      return
    }

    // Multiple trips: build popup HTML
    const items = tripIds.map(id => {
      const t = store.summaries.find(s => s.id === id)!
      return `<div class="pick-item" data-id="${t.id}">
        <div class="pick-time">${t.timeLabel}</div>
        <div class="pick-info">${formatDistance(t.distance)} · ${formatDuration(t.duration)}</div>
      </div>`
    }).join('')

    if (popup) popup.remove()
    popup = new mapboxgl.Popup({ closeOnClick: true, offset: 10, maxWidth: '220px', className: 'trip-picker-popup' })
      .setLngLat(e.lngLat)
      .setHTML(`<div class="pick-list">${items}</div>`)
      .addTo(m)
      .on('close', () => { popup = null })

    // Bind click events on items
    const el = popup.getElement()
    el?.querySelectorAll('.pick-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = (item as HTMLElement).dataset.id
        if (id) { store.selectTrip(id); popup?.remove() }
      })
    })
  })
  m.on('mouseenter', 'overview-hit', () => { m.getCanvas().style.cursor = 'pointer' })
  m.on('mouseleave', 'overview-hit', () => { m.getCanvas().style.cursor = '' })
})

watch(() => store.selectedTripId, (id) => {
  if (!id) return
  const trip = store.summaries.find(s => s.id === id)
  if (trip) fitBounds(trip.bounds)
})

watch(() => store.overviewGeoJSON, (geojson) => {
  if (!geojson || geojson.features.length === 0) return
  const m = map.value
  if (!m) return
  let west = Infinity, south = Infinity, east = -Infinity, north = -Infinity
  for (const f of geojson.features) {
    if (f.geometry.type === 'LineString') {
      for (const c of (f.geometry as { coordinates: number[][] }).coordinates) {
        if (c[0] < west) west = c[0]
        if (c[0] > east) east = c[0]
        if (c[1] < south) south = c[1]
        if (c[1] > north) north = c[1]
      }
    }
  }
  if (isFinite(west)) {
    m.fitBounds([west, south, east, north], { padding: 40, duration: 1500 })
  }
})

const basemapOptions: { key: BasemapKey; label: string }[] = [
  { key: 'dark', label: '暗色' },
  { key: 'light', label: '亮色' },
  { key: 'voyager', label: '彩色' },
  { key: 'vector', label: '矢量' },
  { key: 'topo', label: '地形' },
  { key: 'satellite', label: '卫星' },
]
</script>

<template>
  <div class="map-container" ref="container">
    <div class="basemap-switcher" v-if="showBasemap">
      <button
        v-for="opt in basemapOptions"
        :key="opt.key"
        :class="{ active: currentBasemap === opt.key }"
        @click="setBasemap(opt.key)"
      >{{ opt.label }}</button>
    </div>
    <SpeedLegend />
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.basemap-switcher {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 2px;
  background: #161b22cc;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid #30363d;
  backdrop-filter: blur(8px);
  max-width: calc(100% - 60px);
}
.basemap-switcher button {
  background: none;
  border: none;
  color: #8b949e;
  padding: 5px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.basemap-switcher button:hover { color: #e6edf3; }
.basemap-switcher button.active {
  background: #58a6ff;
  color: #fff;
}
</style>

<style>
/* Global: trip picker popup */
.trip-picker-popup .mapboxgl-popup-content {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 4px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 160px;
}
.trip-picker-popup .mapboxgl-popup-tip { border-top-color: #161b22; }
.pick-item {
  padding: 8px 14px;
  cursor: pointer;
  transition: background 0.15s;
}
.pick-item:hover { background: #1c2128; }
.pick-time { font-size: 13px; font-weight: 600; color: #e6edf3; }
.pick-info { font-size: 11px; color: #8b949e; margin-top: 2px; }
</style>
