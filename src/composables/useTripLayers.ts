import { watch, type Ref } from 'vue'
import type { Map, GeoJSONSource, ExpressionSpecification } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import { SPEED_COLOR_EXPRESSION } from '../utils/constants'

const OVERVIEW_SOURCE_ID = 'overview'
const OVERVIEW_LAYER_ID = 'overview-lines'
const OVERVIEW_HIT_LAYER_ID = 'overview-hit'
const ACTIVE_SOURCE_ID = 'active-trip'
const ACTIVE_LAYER_ID = 'active-trip-lines'
const ACTIVE_HIT_LAYER_ID = 'active-hit'
const ENDPOINTS_SOURCE_ID = 'endpoints'
const ENDPOINTS_LAYER_ID = 'endpoints'

export function useTripLayers(
  map: Ref<Map | null>,
  loaded: Ref<boolean>,
  overview: Ref<FeatureCollection | null>,
  active: Ref<FeatureCollection | null>,
  endpoints: Ref<FeatureCollection | null>,
  selectedTripId: Ref<string | null>,
) {
  function initLayers() {
    const m = map.value
    if (!m) return

    if (!m.getSource(OVERVIEW_SOURCE_ID)) {
      m.addSource(OVERVIEW_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection' as const, features: [] } })
    }
    if (!m.getLayer(OVERVIEW_LAYER_ID)) {
      m.addLayer({
        id: OVERVIEW_LAYER_ID,
        source: OVERVIEW_SOURCE_ID,
        type: 'line',
        paint: {
          'line-color': '#6688cc',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 2, 15, 3] as ExpressionSpecification,
          'line-opacity': 0.6,
        },
      })
    }
    if (!m.getLayer(OVERVIEW_HIT_LAYER_ID)) {
      m.addLayer({
        id: OVERVIEW_HIT_LAYER_ID,
        source: OVERVIEW_SOURCE_ID,
        type: 'line',
        paint: {
          'line-color': 'transparent',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 10, 10, 14, 15, 20] as ExpressionSpecification,
        },
      })
    }

    if (!m.getSource(ACTIVE_SOURCE_ID)) {
      m.addSource(ACTIVE_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection' as const, features: [] } })
    }
    if (!m.getLayer(ACTIVE_LAYER_ID)) {
      m.addLayer({
        id: ACTIVE_LAYER_ID,
        source: ACTIVE_SOURCE_ID,
        type: 'line',
        paint: {
          'line-color': SPEED_COLOR_EXPRESSION as unknown as ExpressionSpecification,
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 12, 4, 16, 6] as ExpressionSpecification,
          'line-opacity': 0.9,
        },
      })
    }
    if (!m.getLayer(ACTIVE_HIT_LAYER_ID)) {
      m.addLayer({
        id: ACTIVE_HIT_LAYER_ID,
        source: ACTIVE_SOURCE_ID,
        type: 'line',
        paint: {
          'line-color': 'transparent',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 14, 12, 18, 16, 22] as ExpressionSpecification,
        },
      })
    }

    if (!m.getSource(ENDPOINTS_SOURCE_ID)) {
      m.addSource(ENDPOINTS_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection' as const, features: [] } })
    }
    if (!m.getLayer(ENDPOINTS_LAYER_ID)) {
      m.addLayer({
        id: ENDPOINTS_LAYER_ID,
        source: ENDPOINTS_SOURCE_ID,
        type: 'circle',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 4, 14, 8] as ExpressionSpecification,
          'circle-color': ['case', ['==', ['get', 'type'], 'start'], '#3fb950', '#f85149'] as ExpressionSpecification,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })
    }

    updateHighlight()
  }

  function updateHighlight() {
    const m = map.value
    if (!m || !m.getLayer(OVERVIEW_LAYER_ID)) return

    const id = selectedTripId.value
    if (id) {
      m.setPaintProperty(OVERVIEW_LAYER_ID, 'line-opacity', [
        'case', ['==', ['get', 'tripId'], id], 1, 0.15,
      ] as ExpressionSpecification)
      m.setPaintProperty(OVERVIEW_LAYER_ID, 'line-width', [
        'interpolate', ['linear'], ['zoom'],
        5, ['case', ['==', ['get', 'tripId'], id], 2, 0.3] as ExpressionSpecification,
        10, ['case', ['==', ['get', 'tripId'], id], 4, 0.8] as ExpressionSpecification,
        15, ['case', ['==', ['get', 'tripId'], id], 6, 1] as ExpressionSpecification,
      ] as ExpressionSpecification)
      m.setPaintProperty(OVERVIEW_LAYER_ID, 'line-color', [
        'case', ['==', ['get', 'tripId'], id], '#88aaff', '#6688cc',
      ] as ExpressionSpecification)
    } else {
      m.setPaintProperty(OVERVIEW_LAYER_ID, 'line-opacity', 0.6)
      m.setPaintProperty(OVERVIEW_LAYER_ID, 'line-width', ['interpolate', ['linear'], ['zoom'], 5, 0.5, 10, 2, 15, 3] as ExpressionSpecification)
      m.setPaintProperty(OVERVIEW_LAYER_ID, 'line-color', '#6688cc')
    }
  }

  function applyData() {
    const m = map.value
    if (!m) return
    const empty: FeatureCollection = { type: 'FeatureCollection', features: [] }
    const src = (id: string) => m.getSource(id) as GeoJSONSource | undefined
    src(OVERVIEW_SOURCE_ID)?.setData(overview.value || empty)
    src(ACTIVE_SOURCE_ID)?.setData(active.value || empty)
    src(ENDPOINTS_SOURCE_ID)?.setData(endpoints.value || empty)
  }

  function updateSource(sourceId: string, geojson: FeatureCollection | null) {
    const m = map.value
    if (!m || !loaded.value) return
    initLayers()
    const src = m.getSource(sourceId) as GeoJSONSource | undefined
    src?.setData(geojson || { type: 'FeatureCollection' as const, features: [] })
  }

  // Re-build layers + data after any style change
  watch(map, (m, oldM) => {
    if (!m) return
    const handler = () => {
      initLayers()
      applyData()
      loaded.value = true
    }
    m.on('styledata', handler)
    if (oldM) oldM.off('styledata', handler)
  }, { immediate: true })

  watch(overview, (g) => updateSource(OVERVIEW_SOURCE_ID, g))
  watch(active, (g) => updateSource(ACTIVE_SOURCE_ID, g))
  watch(endpoints, (g) => updateSource(ENDPOINTS_SOURCE_ID, g))
  watch(selectedTripId, () => updateHighlight())
}
