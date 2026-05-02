<script setup lang="ts">
import type { TripSummary } from '../types'
import { formatDuration, formatDistance, formatSpeed } from '../utils/format'

defineProps<{ trip: TripSummary; selected: boolean }>()
defineEmits<{ select: [] }>()
</script>

<template>
  <div class="trip-item" :class="{ selected }" @click="$emit('select')">
    <div class="trip-time">{{ trip.timeLabel }}</div>
    <div class="trip-stats">
      <span title="距离">{{ formatDistance(trip.distance) }}</span>
      <span class="sep">·</span>
      <span title="时长">{{ formatDuration(trip.duration) }}</span>
    </div>
    <div class="trip-speeds">
      <span class="speed-avg" title="平均速度">{{ formatSpeed(trip.avgSpeed) }}</span>
      <span class="speed-max" title="最高速度">{{ formatSpeed(trip.maxSpeed) }}</span>
    </div>
  </div>
</template>

<style scoped>
.trip-item {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid #21262d;
  transition: background 0.15s;
}
.trip-item:hover { background: #1c2128; }
.trip-item.selected { background: #1c3a5f; border-left: 3px solid #58a6ff; }

.trip-time {
  font-size: 14px;
  font-weight: 600;
  color: #e6edf3;
  margin-bottom: 4px;
}

.trip-stats {
  font-size: 13px;
  color: #8b949e;
  margin-bottom: 2px;
}
.sep { margin: 0 4px; }

.trip-speeds { font-size: 12px; }
.speed-avg { color: #58a6ff; margin-right: 12px; }
.speed-max { color: #f85149; }
</style>
