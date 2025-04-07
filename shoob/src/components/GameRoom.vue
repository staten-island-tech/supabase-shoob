<template>
  <div>
    <h2>Game Room: {{ roomId }}</h2>
    <p>Game State: {{ gameState.gameState || 'Loading...' }}</p>
    <button @click="updateGameState('playing')">Start Game</button>
    <button @click="createGameRoom">Reset Room</button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { db } from '../firebaseConfig'
import { getDatabase, ref as dbRef, set, onValue, update } from 'firebase/database'

const roomId = ref('room1')
const gameState = ref({})

// create room
async function createRoom() {
  await set(dbRef(db, `rooms/${roomId.value}`), {
    players: {},
    gameState: 'waiting',
  })
}

//listen for game state
function listenForGameState() {
  onValue(dbRef(db, `rooms/${roomId.value}`), (snapshot) => {
    if (snapshot.exists()) {
      gameState.value = snapshot.val()
    }
  })
}

function updateGameState() {
    await update(dbRef(db, `rooms/${roomId.value}`), {
    gameState: newState
  });
}

// join room

// leave room

onMounted(() => {
    listenForGameState();
</script>

<style scoped></style>
