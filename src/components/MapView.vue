<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import { useMap } from '../composables/useMap'
import { useTripLayers } from '../composables/useTripLayers'
import { useGpsStore } from '../stores/gps'
import type { BasemapKey } from '../utils/constants'
import SpeedLegend from './SpeedLegend.vue'

const container = ref<HTMLElement | null>(null)

const { map, loaded, currentBasemap, setBasemap, fitBounds } = useMap(container)

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
    <div class="basemap-switcher">
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
