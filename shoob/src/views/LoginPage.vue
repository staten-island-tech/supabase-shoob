<template>
  <div class="register">
    <select v-model="signInOption" name="sign-in-option" id="sign-in-option">
      <option value="in">sign in</option>
      <option value="up">sign up</option>
    </select>

    <form v-if="signInOption === 'up'" @submit.prevent="handleSign">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <form v-if="signInOption === 'in'" @submit.prevent="handleSign">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { registerUser, loginUser } from '../../controllers/userController'

const email = ref('')
const password = ref('')
const error = ref('')

const signInOption = ref('in')

async function handleSign() {
  try {
    if (signInOption.value === 'up') {
      await registerUser(email.value, password.value)
      console.log('sign-up successsful')
    } else {
      await loginUser(email.value, password.value)
    }
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
