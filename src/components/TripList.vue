<script setup lang="ts">
import { computed } from 'vue'
import { useGpsStore } from '../stores/gps'
import TripItem from './TripItem.vue'

const store = useGpsStore()

const grouped = computed(() => {
  const groups: { dateKey: string; trips: typeof store.summaries }[] = []
  let currentKey = ''
  let currentTrips: typeof store.summaries = []

  for (const trip of store.filteredSummaries) {
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
</script>

<template>
  <div class="trip-list" v-if="store.summaries.length > 0">
    <div class="list-header">
      共 {{ filterInfo }}
    </div>
    <div class="list-scroll">
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
</style>
