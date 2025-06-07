<template>
  <div v-for="(room, id) in rooms" :key="id">
    <h3>{{ id }}</h3>
    <ul>
      <li v-for="(player, uid) in room.players" :key="uid">
        {{ player.displayName }}
      </li>
    </ul>
  </div>
</template>

<script setup>
const props = defineProps(['roomName'])
</script>

<style scoped></style>
