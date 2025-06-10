<template>
  <div class="register">
    <nav>
      <button class="loginButtons" @click="selectLogin">Log in</button>
      <button class="loginButtons" @click="selectSignup">Sign up</button>
    </nav>

    <div class="login">
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

    <p v-if="error" class="error-message">{{ error }}</p>
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
  error.value = ''
}

function selectSignup() {
  signInOption.value = 'up'
  error.value = ''
}

async function handleSign() {
  error.value = ''
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
    router.push('/lobby')
  } catch (err) {
    console.log('error')
    error.value = err.message
  }
}
</script>

<style>
body {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
`` .login {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 5rem;
}

.loginButtons {
  margin: 1rem;
  width: 5rem;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
  color: var(--color-text);
  background-color: pink;
}

.register {
  width: 30rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #ccc;
  padding: 20px;
}
</style>
pass
