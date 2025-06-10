<template>
  <ProfileInformation :userData="currentUserData"></ProfileInformation>
</template>

<script setup>
import ProfileInformation from '../components/ProfileInformation.vue'
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const auth = getAuth()
const currentUserData = ref(null)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUserData.value = {
        uid: user.uid,
        email: user.email,
        //displayName: user.displayName,
        //photoURL: user.photoURL,
      }
      console.log('User logged in:', currentUserData.value)
    } else {
      currentUserData.value = null
      console.log('User logged out')
    }
  })
})
</script>

<style scoped></style>
