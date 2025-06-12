<template>
  <div class="profile-card">
    <template v-if="userData">
      <h2>{{ userData.displayName || 'Unnamed User' }}</h2>
      <p>Wins: {{ userData.wins || 0 }}</p>
      <p>High Score: {{ userData.highscore || 0 }}</p>
    </template>
    <p v-else-if="authStore.authReady && !user">Please log in to view your profile.</p>
    <p v-else-if="authStore.authReady && user && !userData">User data not found :(</p>
    <p v-else>Loading profile...</p>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authstore'
import { ref, watch, computed, onUnmounted } from 'vue'
import { db } from '/firebaseConfig.js'
import { ref as dbRef, onValue } from 'firebase/database' // Using onValue for real-time

const userData = ref(null)
const authStore = useAuthStore()
const user = computed(() => authStore.user)

let unsubscribeUserData = null // To store the unsubscribe function

async function fetchUserData(uid) {
  // Always unsubscribe from previous listener before setting up a new one
  if (unsubscribeUserData) {
    unsubscribeUserData()
    unsubscribeUserData = null
  }

  if (!uid) {
    userData.value = null
    return
  }

  const userRef = dbRef(db, `users/${uid}`) // Reference to specific user's data

  // Set up the real-time listener
  unsubscribeUserData = onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        userData.value = snapshot.val() // Data exists, update userData
      } else {
        userData.value = null // No data, set userData to null
      }
    },
    (error) => {
      console.error('Error fetching user data:', error)
      userData.value = null // Handle error
    },
  )
}

// Watch for changes in the logged-in user object
watch(
  user,
  async (newUser) => {
    if (newUser && newUser.uid) {
      await fetchUserData(newUser.uid) // Fetch/listen to data for the new user
    } else {
      userData.value = null // Clear data if no user
      if (unsubscribeUserData) {
        // Unsubscribe if user logs out
        unsubscribeUserData()
        unsubscribeUserData = null
      }
    }
  },
  { immediate: true },
) // Run immediately on component mount

// Clean up the listener when the component is unmounted
onUnmounted(() => {
  if (unsubscribeUserData) {
    unsubscribeUserData()
    unsubscribeUserData = null
  }
})
</script>

<style scoped>
.profile-card {
  max-width: 300px;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  background-color: white;
}
</style>
