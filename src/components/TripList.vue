<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue'
import { useGpsStore } from '../stores/gps'
import TripItem from './TripItem.vue'

const store = useGpsStore()
const listScroll = ref<HTMLElement | null>(null)

const grouped = computed(() => {
  const trips = store.filteredSummaries
  const field = store.sort.field

  // Non-time sorts: flat list grouped by sort field label
  if (field !== 'time') {
    const labels: Record<string, (t: typeof trips[0]) => string> = {
      distance: (t) => {
        const km = t.distance / 1000
        if (km < 10) return '< 10 km'
        if (km < 50) return '10 ~ 50 km'
        if (km < 100) return '50 ~ 100 km'
        return '100+ km'
      },
      maxSpeed: (t) => {
        if (t.maxSpeed < 60) return '< 60 km/h'
        if (t.maxSpeed < 100) return '60 ~ 100 km/h'
        if (t.maxSpeed < 140) return '100 ~ 140 km/h'
        return '140+ km/h'
      },
      avgSpeed: (t) => {
        if (t.avgSpeed < 30) return '< 30 km/h'
        if (t.avgSpeed < 60) return '30 ~ 60 km/h'
        if (t.avgSpeed < 90) return '60 ~ 90 km/h'
        return '90+ km/h'
      },
      duration: (t) => {
        const m = t.duration / 60
        if (m < 15) return '< 15 分钟'
        if (m < 60) return '15 ~ 60 分钟'
        if (m < 180) return '1 ~ 3 小时'
        return '3+ 小时'
      },
    }
    const grouper = labels[field]
    const groups: { dateKey: string; trips: typeof trips }[] = []
    let currentKey = ''
    let currentTrips: typeof trips = []
    for (const trip of trips) {
      const key = grouper(trip)
      if (key !== currentKey) {
        if (currentTrips.length > 0) groups.push({ dateKey: currentKey, trips: currentTrips })
        currentKey = key
        currentTrips = [trip]
      } else {
        currentTrips.push(trip)
      }
    }
    if (currentTrips.length > 0) groups.push({ dateKey: currentKey, trips: currentTrips })
    return groups
  }

  // Time sort: group by date
  const groups: { dateKey: string; trips: typeof trips }[] = []
  let currentKey = ''
  let currentTrips: typeof trips = []
  for (const trip of trips) {
    const key = trip.dateLabel
    if (key !== currentKey) {
      if (currentTrips.length > 0) groups.push({ dateKey: currentKey, trips: currentTrips })
      currentKey = key
      currentTrips = [trip]
    } else {
      currentTrips.push(trip)
    }
  }
  if (currentTrips.length > 0) groups.push({ dateKey: currentKey, trips: currentTrips })
  return groups
})

const filterInfo = computed(() => {
  const total = store.summaries.length
  const filtered = store.filteredSummaries.length
  return filtered === total ? `${total} 个旅程` : `${filtered} / ${total} 个旅程`
})

function selectTrip(tripId: string) {
  store.selectTrip(tripId)
}

const selectedVisible = ref(true)

function checkSelectedVisible() {
  const container = listScroll.value
  const selected = container?.querySelector('.trip-item.selected') as HTMLElement | null
  if (!container || !selected) { selectedVisible.value = true; return }
  const cRect = container.getBoundingClientRect()
  const sRect = selected.getBoundingClientRect()
  selectedVisible.value = sRect.top >= cRect.top && sRect.bottom <= cRect.bottom
}

// Scroll selected item into view
watch(() => store.selectedTripId, () => {
  nextTick(checkSelectedVisible)
})

function scrollToSelected() {
  const el = listScroll.value?.querySelector('.trip-item.selected')
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>

<template>
  <div class="trip-list" v-if="store.summaries.length > 0">
    <div class="list-header">
      <span>共 {{ filterInfo }}</span>
    </div>
    <div class="list-scroll" ref="listScroll" @scroll="checkSelectedVisible">
      <template v-for="group in grouped" :key="group.dateKey">
        <div class="date-group">{{ group.dateKey }}</div>
        <TripItem
          v-for="trip in group.trips"
          :key="trip.id"
          :trip="trip"
          :selected="store.selectedTripId === trip.id"
          @select="selectTrip(trip.id)"
        />
      </template>
      <button
        v-if="store.selectedTripId && !selectedVisible"
        class="locate-btn"
        @click="scrollToSelected"
        title="定位到选中项"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.trip-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 10px 16px;
  font-size: 12px;
  color: #8b949e;
  border-bottom: 1px solid #21262d;
  flex-shrink: 0;
}

.list-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.list-scroll::-webkit-scrollbar { width: 6px; }
.list-scroll::-webkit-scrollbar-track { background: transparent; }
.list-scroll::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }

.date-group {
  padding: 8px 16px 4px;
  font-size: 11px;
  color: #8b949e;
  font-weight: 600;
  text-transform: uppercase;
  background: #0d1117;
  position: sticky;
  top: 0;
  z-index: 1;
}

.locate-btn {
  position: sticky;
  bottom: 12px;
  float: right;
  margin-right: 10px;
  margin-top: -44px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #161b22;
  border: 1px solid #30363d;
  color: #58a6ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: all 0.15s;
}
.locate-btn:hover { background: #1c2128; border-color: #58a6ff; }
</style>
