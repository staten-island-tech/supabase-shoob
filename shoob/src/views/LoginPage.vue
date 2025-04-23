<template>
  <div class="register">
    <form @submit.prevent="handleRegister">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { registerUser } from '../../controllers/userController'

const email = ref('')
const password = ref('')
const error = ref('')

async function handleRegister() {
  try {
    await registerUser(email.value, password.value)
    window.location.href = '/lobby'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
