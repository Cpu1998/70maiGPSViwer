<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import MapView from './components/MapView.vue'
import StatusBar from './components/StatusBar.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar class="sidebar" />
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

.app-layout {
  display: flex;
  width: 100%;
  height: 100%;
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
}
</style>
