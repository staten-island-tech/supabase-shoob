<template>
  <div class="register">
    <h1>hasfhfdjshgkjdhsgkj</h1>

    <button class="loginButtons" @click="selectLogin">Log in</button>
    <button class="loginButtons" @click="selectSignup">Sign up</button>

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

function selectLogin() {
  signInOption.value = 'in'
}
function selectSignup() {
  signInOption.value = 'up'
}

async function handleSign() {
  try {
    if (signInOption.value === 'up') {
      await registerUser(email.value, password.value)
      console.log('sign-up successsful')
    } else {
      await loginUser(email.value, password.value)
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
  width: 100%;
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
