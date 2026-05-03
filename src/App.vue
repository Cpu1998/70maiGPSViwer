<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import MapView from './components/MapView.vue'
import StatusBar from './components/StatusBar.vue'
import { useGpsStore } from './stores/gps'

const store = useGpsStore()
const sidebarOpen = ref(true)
const isMobile = computed(() => window.innerWidth < 768)

if (window.innerWidth < 768) {
  sidebarOpen.value = false
}

// On mobile, close sidebar when a trip is selected
watch(() => store.selectedTripId, (id) => {
  if (id && isMobile.value) sidebarOpen.value = false
})
</script>

<template>
  <div class="app-layout" :class="{ 'sidebar-open': sidebarOpen }">
    <button
      class="sidebar-toggle"
      @click="sidebarOpen = !sidebarOpen"
      :title="sidebarOpen ? '收起面板' : '展开面板'"
    >
      <span v-if="!sidebarOpen">&#9776;</span>
      <span v-else>&#10005;</span>
    </button>
    <Sidebar class="sidebar" v-show="sidebarOpen" @close="sidebarOpen = false" />
    <div class="main-area">
      <MapView />
      <StatusBar />
    </div>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  color: #e6edf3;
  background: #0d1117;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
}

.sidebar {
  flex-shrink: 0;
  width: 360px;
  height: 100%;
  overflow: hidden;
  background: #161b22;
  border-right: 1px solid #30363d;
  display: flex;
  flex-direction: column;
}

.main-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.sidebar-toggle {
  display: none;
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 20;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #161b22cc;
  border: 1px solid #30363d;
  color: #e6edf3;
  font-size: 16px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
}
.sidebar-toggle:hover { border-color: #58a6ff; }

/* Mobile */
@media (max-width: 767px) {
  .sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
  }

  .main-area {
    width: 100%;
    height: 100%;
  }

  .sidebar-toggle {
    display: flex;
  }
}
</style>
