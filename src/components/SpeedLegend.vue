<script setup lang="ts">
import { SPEED_COLOR_STOPS } from '../utils/constants'
</script>

<template>
  <div class="speed-legend">
    <span class="label">速度</span>
    <div class="gradient">
      <div class="bar" :style="{
        background: `linear-gradient(90deg, ${SPEED_COLOR_STOPS.map(([v, c]) => c + ' ' + (v / 140 * 100) + '%').join(', ')})`
      }"></div>
    </div>
    <div class="ticks">
      <span v-for="[v] in SPEED_COLOR_STOPS.filter((_, i) => i % 2 === 0)" :key="v">
        {{ v }}
      </span>
    </div>
    <span class="unit">km/h</span>
  </div>
</template>

<style scoped>
.speed-legend {
  position: absolute;
  bottom: 40px;
  right: 12px;
  background: rgba(22, 27, 34, 0.9);
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
}

.label {
  font-size: 11px;
  color: #8b949e;
  white-space: nowrap;
}

.gradient { width: 120px; }
.bar { height: 8px; border-radius: 4px; }

.ticks {
  position: absolute;
  bottom: 4px;
  left: 48px;
  width: 120px;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #8b949e;
}

.unit {
  font-size: 11px;
  color: #8b949e;
  white-space: nowrap;
}
</style>
