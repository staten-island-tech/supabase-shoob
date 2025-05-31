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
    <button v-if="roomId" @click="leaveRoom">Leave Room</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '/firebaseConfig.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, set, onValue, update, remove, get } from 'firebase/database'

const auth = getAuth()
const roomId = ref('')
const newRoomId = ref('')
const gameState = ref({})
const rooms = ref({})

function selectRoom(id) {
  roomId.value = id
  listenForGameState()
  // makes sure we join a room if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      joinRoom(id)
    }
  })
}

async function createRoom(id) {
  if (!id) {
    console.warn('Room ID cannot be empty.')
    return
  }
  const roomData = {
    players: {},
    gameState: 'waiting',
  }
  await set(dbRef(db, `rooms/${id}`), roomData)
  rooms.value[id] = roomData
  selectRoom(id)
  newRoomId.value = ''
}

async function joinRoom(id) {
  const user = auth.currentUser
  if (!user) return

  // leave any other rooms the user might be in first
  for (const otherRoomId in rooms.value) {
    if (rooms.value[otherRoomId].players && rooms.value[otherRoomId].players[user.uid]) {
      if (rooms.value[otherRoomId].players) {
        delete rooms.value[otherRoomId].players[user.uid]
      }
      await update(dbRef(db, `rooms/${otherRoomId}/players`), {
        [user.uid]: null,
      })

      if (
        rooms.value[otherRoomId].players &&
        Object.keys(rooms.value[otherRoomId].players).length === 0
      ) {
        delete rooms.value[otherRoomId]
        await remove(dbRef(db, `rooms/${otherRoomId}`))
      }
    }
  }

  const playerData = {
    displayName: user.displayName || user.email || 'Player',
  }
  await update(dbRef(db, `rooms/${id}/players/${user.uid}`), playerData)

  if (!rooms.value[id]) {
    rooms.value[id] = { players: {}, gameState: 'waiting' }
  }
  if (!rooms.value[id].players) {
    rooms.value[id].players = {}
  }
  rooms.value[id].players[user.uid] = playerData
}

async function leaveRoom() {
  const user = auth.currentUser
  if (!user || !roomId.value) return

  const currentRoomId = roomId.value
  const playerRef = dbRef(db, `rooms/${currentRoomId}/players/${user.uid}`)
  const playersRef = dbRef(db, `rooms/${currentRoomId}/players`)
  const roomRef = dbRef(db, `rooms/${currentRoomId}`)

  try {
    if (gameState.value.players) {
      delete gameState.value.players[user.uid]
    }
    if (rooms.value[currentRoomId] && rooms.value[currentRoomId].players) {
      delete rooms.value[currentRoomId].players[user.uid]
    }

    gameState.value = {}
    roomId.value = ''

    await remove(playerRef)
    const snapshot = await get(playersRef)
    const playersInRoomAfterRemoval = snapshot.val()

    if (!playersInRoomAfterRemoval || Object.keys(playersInRoomAfterRemoval).length === 0) {
      delete rooms.value[currentRoomId]

      await remove(roomRef)
      console.log(`Room ${currentRoomId} deleted as it's empty.`)
    } else {
      console.log(`Room ${currentRoomId} still has players.`)
    }
  } catch (err) {
    console.error('Error leaving room:', err)
  }
}

function listenForRooms() {
  onValue(dbRef(db, 'rooms'), (snapshot) => {
    if (snapshot.exists()) {
      rooms.value = snapshot.val()
      console.log('Rooms updated from Firebase:', rooms.value)
    } else {
      rooms.value = {}
      console.log('No rooms exist in Firebase.')
    }
  })
}

function listenForGameState() {
  // Always attach the listener to the current roomId. If roomId changes, this will re-run.
  if (roomId.value) {
    onValue(dbRef(db, `rooms/${roomId.value}`), (snapshot) => {
      if (snapshot.exists()) {
        gameState.value = snapshot.val()
      } else {
        // If the room itself is deleted from Firebase, clear local gameState
        gameState.value = {}
        // You might also want to clear roomId.value here if the selected room was deleted
        if (roomId.value === snapshot.key) {
          // Check if the room that got deleted is the one currently selected
          roomId.value = ''
        }
      }
    })
  } else {
    gameState.value = {} // Clear game state if no room is selected
  }
}

onMounted(() => {
  listenForRooms()
})
</script>
<style scoped></style>
