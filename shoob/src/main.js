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
let hasAppMounted = false
authStore.initAuth()

//looks at state changes in authstore, handles initial mounting
authStore.$subscribe((mutation, state) => {
  if (state.authReady && !hasAppMounted) {
    app.mount('#app')
    hasAppMounted = true
  }
})
if (authStore.authReady && !hasAppMounted) {
  app.mount('#app')
  hasAppMounted = true
  console.log('App mounted immediately as auth was already ready.')
}
