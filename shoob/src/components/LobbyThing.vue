<template>
  <div>
    <h2>Rooms</h2>
    <RoomInfo :rooms="rooms"></RoomInfo>

    <ul>
      <li
        :class="{ active: id === roomId, disabled: room.gameState === 'playing' }"
        v-for="(room, id) in rooms"
        :key="id"
      >
        <button @click="selectRoom(id)" :disabled="room.gameState === 'playing'">
          {{ id }}
        </button>
        <span v-if="room.hostId">
          (Host: {{ getPlayerDisplayName(room, room.hostId) }}
          <span v-if="auth.currentUser && room.hostId === auth.currentUser.uid">(You)</span>
          )
        </span>
        <span v-if="room.gameState === 'playing'" style="margin-left: 0.5rem; color: red"
          >(In Progress)</span
        >
      </li>
    </ul>
    <input v-model="newRoomId" placeholder="new room name" />
    <button @click="createRoom(newRoomId)">Create Room</button>

    <hr />
    <h2>Room: {{ roomId }}</h2>
    <p>Game State: {{ gameState.gameState || 'loading...' }}</p>
    <ul>
      <li v-for="(player, id) in gameState.players" :key="id">
        {{ player.displayName }}
        <span v-if="gameState.hostId === id"> (host)</span>
        <span v-if="auth.currentUser && id === auth.currentUser.uid"> (You)</span>
      </li>
    </ul>
    <button
      @click="updateGameState('playing')"
      :disabled="!roomId || gameState.gameState === 'playing'"
    >
      Start Game
    </button>
    <button v-if="roomId" @click="leaveRoom">Leave Room</button>
  </div>
</template>

<script setup>
import RoomInfo from './RoomInfo.vue'

import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '/firebaseConfig.js'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { ref as dbRef, set, onValue, update, remove, get } from 'firebase/database'

const router = useRouter()
const auth = getAuth()
const roomId = ref('')
const newRoomId = ref('')
const gameState = ref({})
const rooms = ref({})

let unsubscribeRooms = null
let unsubscribeGameState = null

const props = defineProps({
  rooms: {
    type: Object,
    required: true,
  },
})

function selectRoom(id) {
  if (unsubscribeGameState) {
    unsubscribeGameState()
    unsubscribeGameState = null
  }

  roomId.value = id
  listenForGameState()
  // makes sure we join a room if user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      joinRoom(id)
    }
  })
}

function getPlayerDisplayName(room, uid) {
  return room.players && room.players[uid]
    ? room.players[uid].displayName || 'Unknown Player'
    : 'Unknown Player'
}

async function createRoom(id) {
  if (!id) {
    console.warn('Room ID cannot be empty.')
    return
  }
  const user = auth.currentUser
  if (!user) {
    console.warn('User not logged in to create a room.')
    return
  }
  const roomData = {
    players: {},
    gameState: 'waiting',
    hostId: user.uid,
  }
  await set(dbRef(db, `rooms/${id}`), roomData)
  selectRoom(id)
  newRoomId.value = ''
}

async function joinRoom(id) {
  const user = auth.currentUser
  if (!user) return

  // leave any other rooms the user might be in first
  const allRoomsSnapshot = await get(dbRef(db, 'rooms'))
  const allRoomsData = allRoomsSnapshot.val()

  if (allRoomsData) {
    for (const otherRoomId in allRoomsData) {
      if (allRoomsData[otherRoomId].players && allRoomsData[otherRoomId].players[user.uid]) {
        // Only remove if it's not the room we are about to join
        if (otherRoomId !== id) {
          await update(dbRef(db, `rooms/${otherRoomId}/players`), {
            [user.uid]: null,
          })

          // Check if the old room is now empty and delete it
          const playersInOldRoomSnapshot = await get(dbRef(db, `rooms/${otherRoomId}/players`))
          const playersInOldRoom = playersInOldRoomSnapshot.val()
          if (!playersInOldRoom || Object.keys(playersInOldRoom).length === 0) {
            await remove(dbRef(db, `rooms/${otherRoomId}`))
            console.log(`Old room ${otherRoomId} deleted as it's empty.`)
          }
        }
      }
    }
  }

  const roomRef = dbRef(db, `rooms/${id}`)
  const roomSnapshot = await get(roomRef)
  let currentHostId = null
  if (roomSnapshot.exists()) {
    currentHostId = roomSnapshot.val().hostId
  }

  const playerData = {
    displayName: user.displayName || user.email || 'Player',
    score: 0,
    abilityPoints: 0,
  }

  const updates = {}
  updates[`rooms/${id}/players/${user.uid}`] = playerData

  // If no host is assigned yet, this user becomes the host
  if (!currentHostId) {
    updates[`rooms/${id}/hostId`] = user.uid
  }

  await update(dbRef(db, '/'), updates)
  console.log(`Player ${user.displayName || user.uid} joined room ${id}.`)
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
    if (unsubscribeGameState) {
      unsubscribeGameState()
      unsubscribeGameState = null
    }
    gameState.value = {}
    roomId.value = ''
  } catch (err) {
    console.error('Error leaving room:', err)
  }
}

function listenForRooms() {
  if (unsubscribeRooms) {
    unsubscribeRooms()
  }
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
    if (unsubscribeGameState) {
      unsubscribeGameState()
    }
    onValue(dbRef(db, `rooms/${roomId.value}`), (snapshot) => {
      if (snapshot.exists()) {
        gameState.value = snapshot.val()
        if (gameState.value.gameState === 'playing' && router.currentRoute.value.name !== 'game') {
          router.push({ name: 'game', params: { roomId: roomId.value } })
        } else if (
          gameState.value.gameState !== 'playing' &&
          router.currentRoute.value.name === 'game'
        ) {
          // If game ends/stops while in game view, navigate back to lobby
          // You might want a slight delay or confirmation here
          // For now, let's keep it simple: if not playing, go back to lobby
          router.push({ name: 'lobby' })
        }
      } else {
        // If the room itself is deleted from Firebase, clear local gameState
        gameState.value = {}
        // You might also want to clear roomId.value here if the selected room was deleted
        if (roomId.value === snapshot.key) {
          // Check if the room that got deleted is the one currently selected
          roomId.value = ''
          if (unsubscribeGameState) {
            unsubscribeGameState()
            unsubscribeGameState = null
          }
        }
      }
    })
  } else {
    if (unsubscribeGameState) {
      unsubscribeGameState()
      unsubscribeGameState = null
    }
    gameState.value = {} // Clear game state if no room is selected
  }
}

async function updateGameState(status) {
  if (!roomId.value) return
  const user = auth.currentUser
  if (!user) return

  // Only the host can change game state
  if (gameState.value.hostId !== user.uid) {
    console.warn('Only the host can start/stop the game.')
    return
  }

  try {
    await update(dbRef(db, `rooms/${roomId.value}`), { gameState: status })
    console.log(`Game state updated to: ${status}`)

    if (status === 'playing' && isHost.value) {
      startMoleGeneration()
    } else if (status === 'ended' && isHost.value) {
      stopMoleGeneration()
      // Also clear all moles from the database when game ends
      await remove(molesRef.value)
    }
  } catch (error) {
    console.error('Error updating game state:', error)
  }
}

onMounted(() => {
  listenForRooms()
})
onUnmounted(() => {
  if (unsubscribeRooms) {
    unsubscribeRooms()
  }
  if (unsubscribeGameState) {
    unsubscribeGameState()
  }
})
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.active {
  background-color: #eaf4ff;
}

div {
  max-width: 800px;
  margin: auto;
  padding: 2rem;
  background-color: #f8f9fa;
  color: #333;
}

h2 {
  margin-bottom: 1rem;
  font-size: 1.75rem;
  color: #2c3e50;
}

ul {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

li {
  margin-bottom: 0.5rem;
  background-color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

li span {
  font-size: 0.9rem;
  color: #555;
}

button {
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #00ff22;
  color: #000000;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #109722;
  color: #ffffff;
}

input {
  margin-top: 1rem;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-right: 0.5rem;
  width: 60%;
}
</style>
