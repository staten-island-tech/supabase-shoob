<template>
  <div class="about">
    <input
      class="emailForm"
      type="email"
      name="email"
      v-model="emailQuery"
      placeholder="put in ur email silly goose"
    />
    <button @click="submitEmail">Submit</button>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
const emailQuery = ref('')

function submitEmail() {
  console.log(emailQuery.value)
  emailQuery.value = ''
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
