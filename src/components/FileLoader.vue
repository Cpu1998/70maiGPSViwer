<script setup lang="ts">
import { useGpsStore } from '../stores/gps'

const store = useGpsStore()
const isDragging = ref(false)

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) store.loadFile(file)
}

function handleFileInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) store.loadFile(file)
}
</script>

<script lang="ts">
import { ref } from 'vue'
</script>

<template>
  <div
    class="file-loader"
    :class="{ dragging: isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="handleDrop"
  >
    <div class="drop-zone" v-if="!store.isParsing && store.summaries.length === 0">
      <div class="drop-icon">📂</div>
      <div class="drop-text">拖拽 GPSData 文件到此处</div>
      <div class="drop-hint">支持 70mai 行车记录仪 GPSData*.txt</div>
      <label class="file-btn">
        选择文件
        <input type="file" accept=".txt" @change="handleFileInput" hidden />
      </label>
    </div>

    <div class="progress-area" v-if="store.isParsing">
      <div class="progress-text">{{ store.parseProgress?.message || '解析中...' }}</div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: (store.parseProgress?.progress || 0) + '%' }"></div>
      </div>
      <div class="progress-detail" v-if="store.parseProgress?.recordsProcessed">
        已处理 {{ store.parseProgress.recordsProcessed.toLocaleString() }} 条记录
      </div>
    </div>

    <div class="error" v-if="store.error">
      {{ store.error }}
    </div>
  </div>
</template>

<style scoped>
.file-loader {
  padding: 16px;
  border-bottom: 1px solid #30363d;
}

.dragging {
  background: rgba(56, 139, 253, 0.1);
}

.drop-zone {
  text-align: center;
  padding: 24px 16px;
  border: 2px dashed #30363d;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;
}

.drop-zone:hover {
  border-color: #58a6ff;
}

.drop-icon { font-size: 32px; margin-bottom: 8px; }
.drop-text { font-size: 15px; color: #e6edf3; margin-bottom: 4px; }
.drop-hint { font-size: 12px; color: #8b949e; margin-bottom: 12px; }

.file-btn {
  display: inline-block;
  padding: 6px 16px;
  background: #238636;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.file-btn:hover { background: #2ea043; }

.progress-area { padding: 16px; }
.progress-text { margin-bottom: 8px; font-size: 13px; }
.progress-bar {
  height: 6px;
  background: #21262d;
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #238636, #58a6ff);
  transition: width 0.3s;
  border-radius: 3px;
}
.progress-detail { font-size: 12px; color: #8b949e; margin-top: 6px; }

.error { color: #f85149; font-size: 13px; margin-top: 8px; }
</style>
