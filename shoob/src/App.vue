<template>
  <div class="app">
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink v-if="authStore.user && !isInGame" to="/lobby">gameroom</RouterLink>
          <RouterLink v-if="authStore.user && !isInGame" to="/profile">profile</RouterLink>
          <button v-if="authStore.user && !isInGame" :userData="user" @click="logout">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/authStore'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { onMounted, computed } from 'vue'

const authStore = useAuthStore()
const user = authStore.user

const route = useRoute()
const isInGame = computed(() => route.name === 'game')

async function logout() {
  await authStore.logoutUser()
}

onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped>
header {
  background-color: #ff95ca;
  padding: 1rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  color: #000000;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

button {
  background-color: #ff00aa;
  color: rgb(0, 0, 0);
  border: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #c0392b;
}
</style>
