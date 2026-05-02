import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'mapbox-gl/dist/mapbox-gl.css'

createApp(App).use(createPinia()).mount('#app')
