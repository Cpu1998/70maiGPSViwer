<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGpsStore } from '../stores/gps'
import type { SortField } from '../types'

const store = useGpsStore()
const expanded = ref(false)

const sortLabels: Record<SortField, string> = {
  time: '时间',
  distance: '距离',
  maxSpeed: '最高速度',
  avgSpeed: '平均速度',
  duration: '时长',
}

const hasActiveFilter = computed(() => {
  const f = store.filter
  return f.dateStart || f.dateEnd ||
    f.minDistance > 0 || f.maxDistance > 0 ||
    f.minDuration > 0 || f.maxDuration > 0 ||
    f.minMaxSpeed > 0 || f.maxMaxSpeed > 0
})

function toggleSortDir() {
  store.sort.dir = store.sort.dir === 'asc' ? 'desc' : 'asc'
}

function resetFilter() {
  store.filter = {
    dateStart: '', dateEnd: '',
    minDistance: 0, maxDistance: 0,
    minDuration: 0, maxDuration: 0,
    minMaxSpeed: 0, maxMaxSpeed: 0,
  }
}
</script>

<template>
  <div class="trip-filter" v-if="store.summaries.length > 0">
    <div class="filter-bar">
      <select class="sort-select" v-model="store.sort.field">
        <option v-for="(label, key) in sortLabels" :key="key" :value="key">{{ label }}</option>
      </select>
      <button class="sort-dir-btn" @click="toggleSortDir" :title="store.sort.dir === 'asc' ? '升序' : '降序'">
        <span :class="store.sort.dir === 'asc' ? 'arrow-up' : 'arrow-down'">&#x25B2;&#x25BC;</span>
        <span class="dir-label">{{ store.sort.dir === 'asc' ? '&#x2191;' : '&#x2193;' }}</span>
      </button>
      <button
        class="filter-toggle"
        :class="{ active: hasActiveFilter }"
        @click="expanded = !expanded"
      >
        &#x2699; 筛选
      </button>
    </div>

    <transition name="slide">
      <div v-if="expanded" class="filter-panel">
        <div class="filter-row">
          <label>日期</label>
          <div class="range-inputs">
            <input type="date" v-model="store.filter.dateStart" />
            <span class="tilde">~</span>
            <input type="date" v-model="store.filter.dateEnd" />
          </div>
        </div>
        <div class="filter-row">
          <label>距离 (km)</label>
          <div class="range-inputs">
            <input type="number" v-model.number="store.filter.minDistance" min="0" step="1" placeholder="最小" />
            <span class="tilde">~</span>
            <input type="number" v-model.number="store.filter.maxDistance" min="0" step="1" placeholder="最大" />
          </div>
        </div>
        <div class="filter-row">
          <label>时长 (分钟)</label>
          <div class="range-inputs">
            <input type="number" v-model.number="store.filter.minDuration" min="0" step="1" placeholder="最小" />
            <span class="tilde">~</span>
            <input type="number" v-model.number="store.filter.maxDuration" min="0" step="1" placeholder="最大" />
          </div>
        </div>
        <div class="filter-row">
          <label>最高速度 (km/h)</label>
          <div class="range-inputs">
            <input type="number" v-model.number="store.filter.minMaxSpeed" min="0" step="10" placeholder="最小" />
            <span class="tilde">~</span>
            <input type="number" v-model.number="store.filter.maxMaxSpeed" min="0" step="10" placeholder="最大" />
          </div>
        </div>
        <button v-if="hasActiveFilter" class="reset-btn" @click="resetFilter">重置筛选</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.trip-filter {
  flex-shrink: 0;
  border-bottom: 1px solid #21262d;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #0d1117;
}

.sort-select {
  flex: 1;
  background: #161b22;
  border: 1px solid #30363d;
  color: #e6edf3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  outline: none;
}
.sort-select:focus { border-color: #58a6ff; }

.sort-dir-btn {
  background: #161b22;
  border: 1px solid #30363d;
  color: #e6edf3;
  width: 30px;
  height: 26px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.sort-dir-btn:hover { border-color: #58a6ff; }

.filter-toggle {
  background: #161b22;
  border: 1px solid #30363d;
  color: #8b949e;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.filter-toggle:hover { border-color: #58a6ff; color: #e6edf3; }
.filter-toggle.active { border-color: #58a6ff; color: #58a6ff; }

.filter-panel {
  padding: 8px 12px 10px;
  background: #0d1117;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-row label {
  font-size: 11px;
  color: #8b949e;
  min-width: 82px;
  flex-shrink: 0;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.range-inputs input {
  flex: 1;
  min-width: 0;
  background: #161b22;
  border: 1px solid #30363d;
  color: #e6edf3;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}
.range-inputs input:focus { border-color: #58a6ff; }
.range-inputs input[type="number"] { -moz-appearance: textfield; }
.range-inputs input::-webkit-inner-spin-button { -webkit-appearance: none; }

.tilde {
  color: #484f58;
  font-size: 12px;
  flex-shrink: 0;
}

.reset-btn {
  background: none;
  border: 1px solid #f85149;
  color: #f85149;
  padding: 3px 0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  width: 100%;
  margin-top: 2px;
}
.reset-btn:hover { background: #f8514920; }

.slide-enter-active, .slide-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.slide-enter-to, .slide-leave-from {
  max-height: 300px;
}
</style>
