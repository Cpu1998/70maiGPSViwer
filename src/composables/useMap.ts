import { ref, onMounted, onUnmounted, shallowRef, type Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { BASEMAP_STYLES, type BasemapKey } from '../utils/constants'

export function useMap(container: Ref<HTMLElement | null>) {
  const map = shallowRef<mapboxgl.Map | null>(null)
  const loaded = ref(false)
  const currentBasemap = ref<BasemapKey>('dark')

  onMounted(() => {
    if (!container.value) return

    mapboxgl.accessToken = 'no-token'
    const m = new mapboxgl.Map({
      container: container.value,
      style: BASEMAP_STYLES.dark as mapboxgl.Style,
      center: [114.13, 32.09],
      zoom: 10,
      attributionControl: false,
    })

    m.addControl(new mapboxgl.NavigationControl(), 'bottom-left')
    m.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

    m.on('load', () => {
      loaded.value = true
    })

    map.value = m
  })

  onUnmounted(() => {
    map.value?.remove()
    map.value = null
  })

  function setBasemap(key: BasemapKey) {
    const m = map.value
    if (!m) return
    currentBasemap.value = key
    loaded.value = false
    m.setStyle(BASEMAP_STYLES[key] as mapboxgl.Style)
  }

  function flyTo(lat: number, lon: number, zoom = 15) {
    map.value?.flyTo({ center: [lon, lat], zoom, duration: 1000 })
  }

  function fitBounds(bounds: { west: number; south: number; east: number; north: number }, padding = 60) {
    map.value?.fitBounds(
      [bounds.west, bounds.south, bounds.east, bounds.north],
      { padding, duration: 1000 },
    )
  }

  return { map, loaded, currentBasemap, setBasemap, flyTo, fitBounds }
}
