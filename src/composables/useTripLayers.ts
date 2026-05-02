import { watch, type Ref } from 'vue'
import type { Map, GeoJSONSource, ExpressionSpecification } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import { SPEED_COLOR_EXPRESSION } from '../utils/constants'

const OVERVIEW_SOURCE_ID = 'overview'
const OVERVIEW_LAYER_ID = 'overview-lines'
const ACTIVE_SOURCE_ID = 'active-trip'
const ACTIVE_LAYER_ID = 'active-trip-lines'
const ENDPOINTS_SOURCE_ID = 'endpoints'
const ENDPOINTS_LAYER_ID = 'endpoints'

export function useTripLayers(
  map: Ref<Map | null>,
  loaded: Ref<boolean>,
  overview: Ref<FeatureCollection | null>,
  active: Ref<FeatureCollection | null>,
  endpoints: Ref<FeatureCollection | null>,
) {
  function initLayers() {
    const m = map.value
    if (!m) return

    if (!m.getSource(OVERVIEW_SOURCE_ID)) {
      m.addSource(OVERVIEW_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
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

    if (!m.getSource(ACTIVE_SOURCE_ID)) {
      m.addSource(ACTIVE_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
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

    if (!m.getSource(ENDPOINTS_SOURCE_ID)) {
      m.addSource(ENDPOINTS_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
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
  }

  function updateSource(sourceId: string, geojson: FeatureCollection | null) {
    const m = map.value
    if (!m || !loaded.value) return
    initLayers()
    const src = m.getSource(sourceId) as GeoJSONSource | undefined
    src?.setData(geojson || { type: 'FeatureCollection', features: [] })
  }

  watch(loaded, (v) => { if (v) initLayers() }, { immediate: true })
  watch(overview, (g) => updateSource(OVERVIEW_SOURCE_ID, g))
  watch(active, (g) => updateSource(ACTIVE_SOURCE_ID, g))
  watch(endpoints, (g) => updateSource(ENDPOINTS_SOURCE_ID, g))
}
