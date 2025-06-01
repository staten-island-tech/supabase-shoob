<template>
  <div class="register">
    <h1>:3</h1>
    <nav>
      <button class="loginButtons" @click="selectLogin">Log in</button>
      <button class="loginButtons" @click="selectSignup">Sign up</button>
    </nav>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('') //need to find a way to display error messages
const signInOption = ref('in')

function selectLogin() {
  signInOption.value = 'in'
}

function selectSignup() {
  signInOption.value = 'up'
}

async function handleSign() {
  try {
    if (signInOption.value === 'up') {
      await authStore.registerUser(email.value, password.value)
      console.log('sign-up successsful')
    } else {
      await authStore.loginUser(email.value, password.value)
    }
    //check out what the below does
    //email.value = ''
    //password.value = ''
    //window.location.href = '/lobby'
  } catch (err) {
    console.log('error')
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

.loginButtons {
  width: 5 rem;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  color: var(--color-text);
  background-color: pink;
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
  border: 0;
}

.register {
  width: 30rem;
}
</style>
