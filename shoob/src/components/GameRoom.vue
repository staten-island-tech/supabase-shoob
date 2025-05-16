<template>
  <div>
    <h2>Rooms</h2>
    <ul>
      <li v-for="(room, id) in rooms" :key="id">
        <button @click="selectRoom(id)">{{ id }}</button>
      </li>
    </ul>
    <input v-model="newRoomId" placeholder="new room name" />
    <button @click="createRoom(newRoomId)">Create Room</button>

    <hr />
    <h2>Room: {{ roomId }}</h2>
    <p>Game State: {{ gameState.gameState || 'loading...' }}</p>
    <ul>
      <li v-for="(player, id) in gameState.players" :key="id">{{ player.displayName }}</li>
    </ul>
    <button @click="updateGameState('playing')">Start Game</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '/firebaseConfig.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, set, onValue, update } from 'firebase/database'

const auth = getAuth() //checks if user is currently logged in.. use pinia?
const roomId = ref('')
const newRoomId = ref('')
const gameState = ref({})
const rooms = ref({})

//when user logs in or logs out

function selectRoom(id) {
  roomId.value = id
  listenForGameState()
  onAuthStateChanged(auth, (user) => {
    if (user) joinRoom(id)
  })
}

async function createRoom(id) {
  console.log(id)
  await set(dbRef(db, `rooms/${id}`), {
    players: {},
    gameState: 'waiting',
  })
  console.log(rooms.value)
  selectRoom(id)
}

async function joinRoom(id) {
  const user = auth.currentUser
  if (!user) return

  await update(dbRef(db, `rooms/${id}/players/${user.uid}`), {
    displayName: user.displayName || user.email || 'Player',
  })
}

async function leaveRoom() {
  const user = auth.currentUser
  if (!user || !roomId.value) return

  await update(dbRef(db, `rooms/${roomId.value}/players`)),
    {
      [user.uid]: null,
    }

  gameState.value = {}
  roomId.value = ''
}

//looks for rooms in the database and calls them
function listenForRooms() {
  onValue(dbRef(db, 'rooms'), (snapshot) => {
    if (snapshot.exists()) {
      rooms.value = snapshot.val()
    }
  })
}

//when data inside the selected room changes, gameState is changed
function listenForGameState() {
  onValue(dbRef(db, `rooms/${roomId.value}`), (snapshot) => {
    if (snapshot.exists()) {
      gameState.value = snapshot.val()
    }
  })
}

onMounted(() => {
  listenForRooms()
})
</script>
<style scoped></style>
