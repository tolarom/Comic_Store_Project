import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'
import { getCurrentUser } from './services/api'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize authentication state from localStorage
const storedToken = localStorage.getItem('authToken')
const storedUser = getCurrentUser()
if (storedToken && storedUser) {
  // Auth state is already loaded from localStorage via api.ts
}

app.mount('#app')
