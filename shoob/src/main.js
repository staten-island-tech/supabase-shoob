import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { useAuthStore } from './stores/authStore'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

//makes sure pinia is pinining
const authStore = useAuthStore()

authStore.initAuth()

authStore.$subscribe((mutation, state) => {
  if (state.authReady) {
    app.mount('#app')
  }
})

if (authStore.authReady) {
  app.mount('#app')
}
