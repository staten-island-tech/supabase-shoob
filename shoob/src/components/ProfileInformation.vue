<template>
  <div class="profile-card">
    <!-- <img v-if="userData.photoURL" :src="userData.photoURL" alt="User Photo" class="avatar" /> -->
    <!-- <h2>{{ userData.displayName || 'Anonymous User' }}</h2>
    <p>{{ userData.email || 'No email provided' }}</p> -->
  </div>
</template>

<script setup>
const props = defineProps(['userData'])
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

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}
</style>
