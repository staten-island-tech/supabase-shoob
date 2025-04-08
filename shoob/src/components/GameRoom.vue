<template>
  <div>
    <h2>Game Room: {{ roomId }}</h2>
    <p>Game State: {{ gameState.gameState || 'omg its loading fr' }}</p>
    <button @click="updateGameState('playing')">Start Game</button>
    <button @click="createRoom()">Reset Room</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '/firebaseConfig.js'
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

async function updateGameState(newState) {
  await update(dbRef(db, `rooms/${roomId.value}`), {
    gameState: newState,
  })
}

// leave room

onMounted(() => {
  listenForGameState()
})
</script>

<style scoped></style>
