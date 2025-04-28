import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../firebaseConfig'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  onAuthStateChanged(auth, (firebaseUser) => {
    user.value = firebaseUser
  })

  return { user }
})
