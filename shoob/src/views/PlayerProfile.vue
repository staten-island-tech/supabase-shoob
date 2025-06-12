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
import { ref as dbRef, get, onValue } from 'firebase/database'

const userData = ref(null)
const authStore = useAuthStore()
const user = computed(() => authStore.user)

console.log('Component mounted or re-rendered:')
console.log('authStore.authReady:', authStore.authReady.value) // Use .value for ref
console.log('authStore.user:', authStore.user)
console.log('computed user:', user.value) // Use .value for computed ref

// Use a variable to hold the unsubscribe function for the real-time listener
let unsubscribeUserData = null

// Function to fetch user data
async function fetchUserData(uid) {
  // Unsubscribe from previous listener if it exists
  if (unsubscribeUserData) {
    unsubscribeUserData()
    unsubscribeUserData = null
  }

  if (!uid) {
    userData.value = null // Clear data if no UID
    return
  }

  const userRef = dbRef(db, `users/${uid}`)

  // Use onValue for real-time updates to the profile, which is generally better
  // for displaying live user stats (e.g., if wins change elsewhere)
  unsubscribeUserData = onValue(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        userData.value = snapshot.val()
        console.log('User data loaded:', userData.value)
      } else {
        userData.value = null
        console.log('User data does not exist for UID:', uid)
      }
    },
    (error) => {
      console.error('Error fetching user data:', error)
      userData.value = null // Clear data on error
      // Optionally, display a user-friendly error message
    },
  )
}

// Watch for changes in the user object from the auth store
// This ensures that if the user logs in/out, the profile updates
watch(
  user,
  async (newUser, oldUser) => {
    if (newUser && newUser.uid) {
      // Only fetch if a new valid user is present
      await fetchUserData(newUser.uid)
    } else {
      // If user logs out or becomes null, clear the data
      userData.value = null
      if (unsubscribeUserData) {
        // Also unsubscribe if the user logs out
        unsubscribeUserData()
        unsubscribeUserData = null
      }
    }
  },
  { immediate: true },
) // immediate: true runs the watcher once immediately on component mount

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
