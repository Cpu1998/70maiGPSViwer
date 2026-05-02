<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useMap } from '../composables/useMap'
import { useTripLayers } from '../composables/useTripLayers'
import { useGpsStore } from '../stores/gps'
import SpeedLegend from './SpeedLegend.vue'

const container = ref<HTMLElement | null>(null)

const token = import.meta.env.VITE_MAPBOX_TOKEN || localStorage.getItem('mapbox_token') || ''
const { map, loaded, fitBounds } = useMap(container, token)

const store = useGpsStore()

useTripLayers(
  map,
  loaded,
  toRef(store, 'overviewGeoJSON'),
  toRef(store, 'activeTripGeoJSON'),
  toRef(store, 'activeEndpoints'),
)

watch(() => store.selectedTripId, (id) => {
  if (!id) return
  const trip = store.summaries.find(s => s.id === id)
  if (trip) fitBounds(trip.bounds)
})

// After overview loaded, fit to all data
watch(() => store.overviewGeoJSON, (geojson) => {
  if (!geojson || geojson.features.length === 0) return
  const m = map.value
  if (!m) return
  // Calculate total bounds
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
</script>

<template>
  <div class="map-container" ref="container">
    <div class="map-placeholder" v-if="!token">
      <div class="token-prompt">
        <p>请设置 Mapbox Access Token</p>
        <p class="hint">在项目根目录 .env 文件中设置 VITE_MAPBOX_TOKEN</p>
      </div>
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

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d1117;
}

.token-prompt {
  text-align: center;
  color: #e6edf3;
}
.token-prompt .hint {
  color: #8b949e;
  font-size: 12px;
  margin-top: 8px;
}
</style>
