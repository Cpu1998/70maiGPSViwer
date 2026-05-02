<script setup lang="ts">
import FileLoader from './FileLoader.vue'
import TripFilter from './TripFilter.vue'
import TripList from './TripList.vue'
import { useGpsStore } from '../stores/gps'

const store = useGpsStore()
const version = __APP_VERSION__
</script>

<template>
  <aside class="sidebar-inner">
    <div class="sidebar-header">
      <h1 class="logo">70mai GPS 查看器 <span class="version">v{{ version }}</span></h1>
      <button v-if="store.summaries.length > 0" class="clear-btn" @click="store.clearAll()" title="清除数据">✕</button>
    </div>
    <FileLoader />
    <TripFilter />
    <TripList />
  </aside>
</template>

<style scoped>
.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #30363d;
  flex-shrink: 0;
}

.logo {
  font-size: 15px;
  font-weight: 700;
  color: #e6edf3;
}
.version {
  font-size: 11px;
  font-weight: 400;
  color: #484f58;
}

.clear-btn {
  background: none;
  border: 1px solid #30363d;
  color: #8b949e;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.15s;
}
.clear-btn:hover { border-color: #f85149; color: #f85149; }
</style>
