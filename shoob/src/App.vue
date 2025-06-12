<template>
  <div class="app">
    <header>
      <div class="wrapper">
        <nav>
          <RouterLink v-if="authStore.user" to="/lobby">gameroom</RouterLink>
          <RouterLink v-if="authStore.user" to="/profile">profile</RouterLink>
          <button v-if="authStore.user" :userData="user" @click="logout">Logout</button>
        </nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/authStore'
import { RouterLink, RouterView } from 'vue-router'
import { onMounted } from 'vue'

//this is from pinia
const authStore = useAuthStore()
const user = authStore.user

async function logout() {
  await authStore.logoutUser()
}
onMounted(() => {
  authStore.initAuth()
})
</script>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

.stuff {
  background-color: white;
}
</style>
