<script setup lang="ts">
import { useGpsStore } from '../stores/gps'
import { formatDistance } from '../utils/format'

const store = useGpsStore()
</script>

<template>
  <div class="status-bar" v-if="store.fileStats">
    <span>{{ store.fileStats.fileName }}</span>
    <span class="sep">|</span>
    <span>{{ store.fileStats.totalRecords.toLocaleString() }} 条记录</span>
    <span class="sep">|</span>
    <span>{{ store.summaries.length }} 个旅程</span>
    <template v-if="store.summaries.length > 0">
      <span class="sep">|</span>
      <span>总距离 {{ formatDistance(store.summaries.reduce((s, t) => s + t.distance, 0)) }}</span>
    </template>
  </div>
</template>

<style scoped>
.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px 16px;
  background: rgba(22, 27, 34, 0.85);
  border-top: 1px solid #21262d;
  font-size: 12px;
  color: #8b949e;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
}
.sep { margin: 0 4px; color: #30363d; }
</style>
