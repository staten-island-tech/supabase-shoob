<!-- <template>
  <div class="game-view">
    <h2 v-if="roomId">Playing in Room: {{ roomId }}</h2>
    <p v-else>No room selected. Please go back to the <router-link to="/">lobby</router-link>.</p>

    <div v-if="roomId && gameState.gameState">
      <p>Game State: {{ gameState.gameState }}</p>

      <h3>Players:</h3>
      <div class="players-in-game">
        <div v-for="(player, id) in gameState.players" :key="id" class="player-score-card">
          <h4>{{ player.displayName }}</h4>
          <p>Score: {{ player.score || 0 }}</p>
          <p>Ability: {{ player.abilityPoints || 0 }}</p>
          <span v-if="gameState.hostId === id"> (Host)</span>
          <span v-if="auth.currentUser && id === auth.currentUser.uid"> (You)</span>
        </div>
      </div>

      <div class="game-controls">
        <button
          v-if="isHost && gameState.gameState === 'playing'"
          @click="updateGameState('ended')"
        >
          End Game
        </button>
        <button @click="leaveRoom">Leave Room</button>
      </div>

      <hr />

      <div class="game-area">
        <h3>Whack-A-Mole!</h3>
        <p v-if="gameState.gameState === 'waiting'">Waiting for host to start the game...</p>
        <p v-else-if="gameState.gameState === 'ended'">Game Over!</p>
        <p v-else-if="gameState.gameState !== 'playing'">Game is not playing.</p>

        <div
          v-if="gameState.gameState === 'playing'"
          class="grid-container"
          :style="{
            gridTemplateColumns: `repeat(${gameState.gridDim || 4}, 1fr)`,
            gridTemplateRows: `repeat(${gameState.gridDim || 4}, 1fr)`,
            width: `${(gameState.gridDim || 4) * 80}px` /* Adjust for desired hole size */,
            height: `${(gameState.gridDim || 4) * 80}px`,
          }"
        >
          <div
            v-for="n in (gameState.gridDim || 4) ** 2"
            :key="n - 1"
            class="hole"
            @click="whack(n - 1)"
          >
            <template v-for="(mole, moleId) in currentVisibleMoles" :key="moleId">
              <img
                v-if="mole.index === n - 1 && mole.whackedBy === null && mole.type === 'normal'"
                alt="Normal Mole"
                class="mole-img"
                draggable="false"
                src="/enemy.png"
              />
              <img
                v-if="mole.index === n - 1 && mole.whackedBy === null && mole.type === 'special'"
                alt="Special Mole"
                class="mole-img special-mole"
                draggable="false"
                src="/enemy.png"
              />
              <img
                v-if="mole.index === n - 1 && mole.whackedBy !== null && mole.whackedAt"
                alt="Whack Effect"
                class="mole-effect-img"
                draggable="false"
                :src="mole.whackedBy === auth.currentUser?.uid ? '/bonk.avif' : '/enemy.png'"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> -->
<template>
  <div class="game-view">
    <h2 v-if="roomId">Playing in Room: {{ roomId }}</h2>
    <p v-else>No room selected. Please go back to the <router-link to="/">lobby</router-link>.</p>

    <div v-if="roomId && gameState.gameState">
      <p>Game State: {{ gameState.gameState }}</p>

      <h3>Players:</h3>
      <div class="players-in-game">
        <div v-for="(player, id) in gameState.players" :key="id" class="player-score-card">
          <h4>{{ player.displayName }}</h4>
          <p>Score: {{ player.score || 0 }}</p>
          <p>Ability: {{ player.abilityPoints || 0 }}</p>
          <span v-if="gameState.hostId === id"> (Host)</span>
          <span v-if="auth.currentUser && id === auth.currentUser.uid"> (You)</span>
        </div>
      </div>

      <div class="game-controls">
        <button
          v-if="isHost && gameState.gameState === 'playing'"
          @click="updateGameState('ended')"
        >
          End Game
        </button>
        <button @click="leaveRoom">Leave Room</button>
      </div>

      <hr />

      <div class="game-area">
        <h3>Whack-A-Mole!</h3>
        <p v-if="gameState.gameState === 'waiting'">Waiting for host to start the game...</p>
        <p v-else-if="gameState.gameState === 'ended'">Game Over!</p>
        <p v-else-if="gameState.gameState !== 'playing'">Game is not playing.</p>

        <div
          v-if="gameState.gameState === 'playing'"
          class="grid-container"
          :style="{
            gridTemplateColumns: `repeat(${gameState.gridDim || 4}, 1fr)`,
            gridTemplateRows: `repeat(${gameState.gridDim || 4}, 1fr)`,
            width: `${(gameState.gridDim || 4) * 80}px` /* Adjust for desired hole size */,
            height: `${(gameState.gridDim || 4) * 80}px`,
          }"
        >
          <div
            v-for="n in (gameState.gridDim || 4) ** 2"
            :key="n"
            class="hole"
            @click="whack(n - 1)"
          >
            <!-- Check if a mole exists at this spot -->
            <template
              v-for="(mole, moleId) in currentVisibleMoles"
              :key="moleId"
              @click="whack(n - 1)"
            >
              <img
                v-if="mole.index === n - 1"
                class="mole-img"
                :alt="mole.type"
                draggable="false"
                :src="mole.type === 'normal' ? '/enemy.png' : '/enemyBlue.png'"
                @click="whack(n - 1)"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { db } from '/firebaseConfig.js'
import { getAuth } from 'firebase/auth'
import {
  ref as dbRef,
  push,
  serverTimestamp,
  onValue,
  update,
  remove,
  get,
} from 'firebase/database'
import router from '../router'

// Props: roomId is passed from the router
const props = defineProps({
  roomId: {
    type: String,
    required: true,
  },
})

const auth = getAuth()

let moleGenerationInterval = null
let moleCleanupInterval = null
const MOLE_LIFETIME_MS = 2000

// Game State and Moles
const gameState = ref({}) // Represents the specific room's full game state
const currentVisibleMoles = ref({}) // Live moles currently on the board

// Reactive Computeds for host and current user
const currentUserId = computed(() => auth.currentUser?.uid)
const isHost = computed(() => currentUserId.value === gameState.value.hostId)
// Firebase References (computed based on the roomId prop)
const gameRef = computed(() => dbRef(db, `rooms/${props.roomId}`))
const molesRef = computed(() => dbRef(db, `rooms/${props.roomId}/moles`))

// Firebase Unsubscribe Functions
let unsubscribeGameState = null
let unsubscribeMoles = null

// --- Game Logic Functions ---

function startMoleGeneration() {
  if (!isHost.value || gameState.value.gameState !== 'playing') {
    console.log('Not starting mole generation: Not host or game not playing.')
    return
  }

  if (moleGenerationInterval) clearInterval(moleGenerationInterval)
  if (moleCleanupInterval) clearInterval(moleCleanupInterval)

  moleGenerationInterval = setInterval(() => {
    generateAndPublishMole()
  }, 1000) // Moles every 1 second
  console.log('Mole generation started by host.')

  moleCleanupInterval = setInterval(() => {
    cleanUpExpiredMoles()
  }, 500)
}

function stopMoleGeneration() {
  if (moleGenerationInterval) {
    clearInterval(moleGenerationInterval)
    moleGenerationInterval = null
  }
  if (moleCleanupInterval) {
    clearInterval(moleCleanupInterval)
    moleCleanupInterval = null
  }
  console.log('Mole generation stopped by host.')
}

async function cleanUpExpiredMoles() {
  if (!isHost.value || !props.roomId) {
    console.log('Cleanup skipped: Not host or no roomId.')
    return
  }

  const now = Date.now()
  console.log('Current time for cleanup:', now)
  const molesSnapshot = await get(molesRef.value)
  const moles = molesSnapshot.val()
  console.log('Current time for cleanup:', now)

  if (!moles) {
    console.log('No moles found to clean up.')
    return
  }

  const updates = {}
  for (const moleId in moles) {
    const mole = moles[moleId]
    console.log(
      `Checking mole ${moleId}: despawnAt=${mole.despawnAt}, whackedBy=${mole.whackedBy}, now=${now}`,
    )

    if (mole.despawnAt && mole.despawnAt <= now) {
      updates[`rooms/${props.roomId}/moles/${moleId}`] = null // Mark for removal
      console.log(`Marking expired mole ${moleId} for removal (whacked: ${!!mole.whackedBy}).`)
    }
  }

  if (Object.keys(updates).length > 0) {
    try {
      await update(dbRef(db, '/'), updates)
      console.log('Cleaned up expired moles:', Object.keys(updates).length, 'Updates:', updates)
    } catch (error) {
      console.error('Error cleaning up moles:', error)
    }
  } else {
    console.log('No moles expired or ready for removal.')
  }
}

async function generateAndPublishMole() {
  if (!props.roomId || !isHost.value || gameState.value.gameState !== 'playing') return

  const currentGridSize = (gameState.value.gridDim || 4) ** 2
  const random = Math.floor(Math.random() * 12)
  const moleType = random === 1 ? 'special' : 'normal'
  const moleIndex = Math.floor(Math.random() * currentGridSize)

  const now = Date.now()
  const newMoleData = {
    index: moleIndex,
    type: moleType,
    createdAt: serverTimestamp(),
    whackedBy: null,
    despawnAt: now + MOLE_LIFETIME_MS,
  }
  console.log('Attempting to push newMoleData:', newMoleData)

  try {
    await push(molesRef.value, newMoleData)
  } catch (error) {
    console.error('Host failed to generate mole:', error)
  }
}

async function whack(clickedIndex) {
  console.log('attempted to whack', clickedIndex)
  if (gameState.value.gameState !== 'playing') {
    console.log('Game not in playing state. Whack skipped.')
    return
  }

  const user = auth.currentUser
  if (!user) return

  let whackedMoleId = null
  console.log('Current visible moles:', currentVisibleMoles.value)
  for (const moleId in currentVisibleMoles.value) {
    const mole = currentVisibleMoles.value[moleId]
    console.log(
      `Checking mole ID: ${moleId}, Index: ${mole.index}, WhackedBy: ${mole.whackedBy} (type: ${typeof mole.whackedBy})`,
    )

    if (
      mole &&
      mole.index === clickedIndex &&
      (mole.whackedBy === null || typeof mole.whackedBy === 'undefined')
    ) {
      whackedMoleId = moleId
      console.log('Found whackable mole ID:', whackedMoleId)
      break
    }
  }

  if (whackedMoleId) {
    try {
      // *** COMBINE ALL MOLE UPDATES INTO A SINGLE CALL ***
      await update(dbRef(db, `rooms/${props.roomId}/moles/${whackedMoleId}`), {
        whackedBy: user.uid,
        whackedAt: serverTimestamp(),
        despawnAt: Date.now(), // This needs to be part of the same atomic update
      })
      console.log(
        `Player ${user.displayName || user.uid} successfully whacked mole ${whackedMoleId} and set despawnAt.`,
      )
      // *** END COMBINED UPDATE ***

      // 2. Add score to the player
      const playerRef = dbRef(db, `rooms/${props.roomId}/players/${user.uid}`)
      const playerSnapshot = await get(playerRef)
      const currentPlayer = playerSnapshot.val()
      const currentScore = currentPlayer?.score || 0

      let pointsToAdd = 10
      const whackedMole = currentVisibleMoles.value[whackedMoleId]
      if (whackedMole && whackedMole.type === 'special') {
        pointsToAdd = 50
      }

      await update(playerRef, { score: currentScore + pointsToAdd })
      console.log(
        `Player ${user.displayName || user.uid} scored ${pointsToAdd} points. New score: ${currentScore + pointsToAdd}`,
      )
    } catch (error) {
      console.error('Error whacking mole (Client-side caught error):', error)
      // If you see "PERMISSION_DENIED" here, your Firebase rules for player scores need adjustment.
    }
  } else {
    console.log('No whackable mole found at clicked index or already whacked.')
  }
}
// --- Game State Update (for host to end game) ---
async function updateGameState(status) {
  if (!props.roomId) return
  const user = auth.currentUser
  if (!user) return

  if (gameState.value.hostId !== user.uid) {
    console.warn('Only the host can change game state.')
    return
  }

  try {
    await update(gameRef.value, { gameState: status })
    console.log(`Game state updated to: ${status} by host.`)
    // Host specifically clears moles when game ends
    if (status === 'ended') {
      await remove(molesRef.value)
    }
  } catch (error) {
    console.error('Error updating game state:', error)
  }
}

// --- Leave Room Logic (for all players) ---
async function leaveRoom() {
  const user = auth.currentUser
  if (!user || !props.roomId) return

  const currentRoomId = props.roomId
  const playerRef = dbRef(db, `rooms/${currentRoomId}/players/${user.uid}`)
  const playersRef = dbRef(db, `rooms/${currentRoomId}/players`)
  const roomRef = dbRef(db, `rooms/${currentRoomId}`)

  try {
    let wasHost = gameState.value.hostId === user.uid

    await remove(playerRef)

    const snapshot = await get(playersRef)
    const playersInRoomAfterRemoval = snapshot.val()

    if (!playersInRoomAfterRemoval || Object.keys(playersInRoomAfterRemoval).length === 0) {
      await remove(roomRef)
      console.log(`Room ${currentRoomId} deleted as it's empty.`)
    } else {
      if (wasHost) {
        const remainingPlayerUids = Object.keys(playersInRoomAfterRemoval)
        if (remainingPlayerUids.length > 0) {
          const newHostId = remainingPlayerUids[0]
          await update(roomRef, { hostId: newHostId })
        } else {
          await update(roomRef, { hostId: null })
        }
      }
      console.log(`Room ${currentRoomId} still has players.`)
    }

    // Clean up local state and listeners
    // Unsubscribe from Firebase listeners
    if (unsubscribeGameState) {
      unsubscribeGameState()
      unsubscribeGameState = null
    }
    if (unsubscribeMoles) {
      unsubscribeMoles()
      unsubscribeMoles = null
    }
    stopMoleGeneration() // Stop mole generation if this client was host

    gameState.value = {}
    currentVisibleMoles.value = {}
    router.push({ name: 'lobby' }) // Navigate back to the lobby
  } catch (err) {
    console.error('Error leaving room:', err)
  }
}

// --- Firebase Listeners for GameView ---
function listenForGameState() {
  if (unsubscribeGameState) {
    unsubscribeGameState()
  }
  if (props.roomId) {
    unsubscribeGameState = onValue(gameRef.value, (snapshot) => {
      if (snapshot.exists()) {
        gameState.value = snapshot.val()
        // If game state changes to not playing, navigate back to lobby
        if (gameState.value.gameState !== 'playing' && router.currentRoute.value.name === 'game') {
          console.log("Game state is not 'playing'. Redirecting to lobby.")
          router.push({ name: 'lobby' })
        }
      } else {
        // Room was deleted while user was in game
        console.log(`Room ${props.roomId} was deleted. Redirecting to lobby.`)
        gameState.value = {}
        router.push({ name: 'lobby' })
      }
    })
  } else {
    gameState.value = {}
  }
}

function listenForMoles() {
  if (unsubscribeMoles) {
    unsubscribeMoles()
  }
  if (props.roomId) {
    unsubscribeMoles = onValue(molesRef.value, (snapshot) => {
      const molesData = snapshot.val()
      if (molesData) {
        // Ensure molesData is always an object, not just if it exists.
        // Firebase .val() returns null if no data, otherwise an object.
        // We want to ensure that if a mole is removed, its entry is null, not the entire list.
        // The Proxy(Object) output you showed indicates it IS an object.
        currentVisibleMoles.value = molesData
        console.log('Current moles from Firebase:', molesData)
      } else {
        currentVisibleMoles.value = {} // Always ensure it's an empty object if no moles
        console.log('No moles from Firebase. Setting currentVisibleMoles to empty object.')
      }
    })
  } else {
    currentVisibleMoles.value = {}
  }
}

// --- Watchers for GameView ---
// Watch gameState.value.gameState to trigger mole generation/stopping for the host
watch(
  () => gameState.value.gameState,
  (newStatus) => {
    console.log('Game State changed to:', newStatus, 'Is Host:', isHost.value)
    if (newStatus === 'playing' && isHost.value) {
      startMoleGeneration()
    } else if (newStatus !== 'playing') {
      stopMoleGeneration()
    }
  },
  { immediate: true }, // Run immediately on component mount/if gameState is already set
)

watch(
  () => props.roomId,
  (newRoomId) => {
    if (newRoomId) {
      listenForMoles()
    } else {
      // If roomId becomes null/undefined, clean up moles and listener
      if (unsubscribeMoles) {
        unsubscribeMoles()
        unsubscribeMoles = null
      }
      currentVisibleMoles.value = {}
    }
  },
  { immediate: true },
)

// --- Lifecycle Hooks ---
onMounted(() => {
  // GameView gets roomId from props, so use it to set up listeners immediately
  if (props.roomId) {
    listenForGameState() // This will also handle initial navigation away if state is not 'playing'
    listenForMoles()
  } else {
    // If for some reason roomId isn't provided (e.g., direct URL access without ID)
    router.push({ name: 'lobby' })
  }
})

onUnmounted(() => {
  // Crucial: Clean up all listeners and intervals when leaving the game view
  if (unsubscribeGameState) {
    unsubscribeGameState()
  }
  if (unsubscribeMoles) {
    unsubscribeMoles()
  }
  stopMoleGeneration() // Ensure interval is cleared
})
</script>

<style scoped>
.game-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
.players-in-game {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}
.player-score-card {
  background-color: #e0ffe0;
  padding: 10px 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  min-width: 150px;
}
.game-controls button {
  margin: 5px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #dc3545; /* Red for end/leave */
  color: white;
}
.game-controls button:hover {
  opacity: 0.9;
}

/* Game Area Styles (Copied from previous template) */
.game-area {
  margin-top: 20px;
  text-align: center;
}

.grid-container {
  display: grid;
  border: 5px solid #8b4513; /* Brown border for the game board */
  border-radius: 10px;
  margin: 20px auto;
  background-color: #a0522d; /* Dirt-like background */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  position: relative; /* For positioning moles */
  position: relative; /* REQUIRED for z-index to work */
  z-index: 0; /* Puts it behind elements with z-index: 0 or auto */
}

.hole {
  border: 2px solid #5a2c0c; /* Darker brown border for holes */
  background-color: #6b3e1f; /* Darker dirt inside holes */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative; /* Crucial for positioning mole images */
  overflow: hidden; /* Hide parts of mole if it's too big for hole */
  cursor: pointer;
  border-radius: 5px; /* Slightly rounded holes */
}

.hole:hover {
  background-color: #8b4513; /* Highlight hole on hover */
}

.mole-img,
.mole-effect-img {
  max-width: 90%; /* Ensure moles fit within the hole */
  max-height: 90%;
  position: absolute; /* Position within the hole */
  bottom: 0; /* Make them appear from the bottom */
  animation: pop-up 0.3s ease-out forwards; /* Simple pop-up animation */
}

.special-mole {
  animation: special-mole-pop-up 0.3s ease-out forwards; /* Slightly different animation for special */
}

.mole-effect-img {
  animation: bonk-fade-out 0.5s ease-out forwards; /* Bonk/poof effect animation */
  z-index: 9; /* Ensure effect is on top */
}

.mole {
  position: absolute;
  z-index: 10; /* ensure it’s above other elements */
  pointer-events: auto;
  cursor: pointer; /* visual feedback */
}

.hole {
  cursor: pointer;
}

/* Animations */
@keyframes pop-up {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes special-mole-pop-up {
  0% {
    transform: translateY(100%) scale(0.8);
  }
  100% {
    transform: translateY(0) scale(1.1);
  } /* Slightly bigger for special */
}

@keyframes bonk-fade-out {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(-50%) scale(1.2);
  }
}

/* Responsive adjustments for game board (optional but good practice) */
@media (max-width: 600px) {
  .grid-container {
    width: 90vw !important; /* Use viewport width on smaller screens */
    height: 90vw !important;
  }
}
#app,
.app-main {
  position: relative; /* If these have a background, they also need a position to define stacking context */
  z-index: 0; /* Or any number greater than -1 to ensure the grid is behind them */
}
</style>
