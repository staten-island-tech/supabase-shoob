<template></template>

<script setup>
import { ref as dbRef, push, serverTimestamp, remove, update } from 'firebase/database'
import { computed } from 'vue'

//game and mole ref
const gameRef = computed(() => dbRef(db, `rooms/${roomId.value}`))
const molesRef = computed(() => dbRef(db, `rooms/${roomId.value}/moles`))
const currentUserId = computed(() => auth.currentUser?.uid)
const isHost = computed(() => currentUserId.value === gameState.value.hostId)
const gameState = ref({})

const currentVisibleMoles = ref({})
let moleGenerationInterval = null

function startMoleGeneration() {
  // only host starts and only if game is playing
  if (!isHost.value || gameStatus.value !== 1) return

  // Clear any existing interval to prevent duplicates
  if (moleGenerationInterval) {
    clearInterval(moleGenerationInterval)
  }

  moleGenerationInterval = setInterval(() => {
    generateAndPublishMole()
  }, 1000) //change number to make moles more sporradic
}

function stopMoleGeneration() {
  if (moleGenerationInterval) {
    clearInterval(moleGenerationInterval)
    moleGenerationInterval = null
  }
}

async function generateAndPublishMole() {
  if (!roomId.value || !isHost.value) return

  const currentGridSize = (gameState.value.gridDim || 4) ** 2 //** 2 is basically exponent 2

  const random = Math.floor(Math.random() * 12)
  // if randomly generated number = 1, its special
  const moleType = random === 1 ? 'special' : 'normal'
  let moleIndex = Math.floor(Math.random() * currentGridSize)

  const newMoleData = {
    index: moleIndex,
    type: moleType,
    createdAt: serverTimestamp(), // idk if this is needed
    whackedBy: null, // initially not whacked
  }

  try {
    //push generates a unique ID for the mole
    await push(molesRef.value, newMoleData)
    console.log('Mole generated and pushed:', newMoleData)
  } catch (error) {
    console.error('Host failed to generate mole:', error)
  }
}

//
watch(
  () => gameState.value.gameState,
  (newStatus) => {
    if (newStatus === 'playing' && isHost.value) {
      startMoleGeneration()
    } else if (newStatus !== 'playing' && isHost.value) {
      stopMoleGeneration()
    }
  },
)

async function whack(clickedIndex) {
  if (gameState.value.gameState !== 'playing') return // Only allow whacking if game is playing

  const user = auth.currentUser
  if (!user) return

  let whackedMoleId = null
  let whackedMoleData = null

  // Find if any mole exists at the clicked index and is not yet whacked
  for (const moleId in currentVisibleMoles.value) {
    const mole = currentVisibleMoles.value[moleId]
    if (mole.index === clickedIndex && mole.whackedBy === null) {
      whackedMoleId = moleId
      whackedMoleData = mole
      break // Found the first unwhacked mole at this index
    }
  }

  if (whackedMoleId) {
    // Attempt to claim the mole by updating its `whackedBy` property
    try {
      await update(dbRef(db, `rooms/${roomId.value}/moles/${whackedMoleId}`), {
        whackedBy: user.uid,
        whackedAt: serverTimestamp(), // Record when it was whacked
      })

      // After a successful update by *any* player, the host or a Cloud Function
      // will see this update and handle scoring and mole removal.
      console.log(`Player ${user.uid} attempted to whack mole ${whackedMoleId}`)

      // Optional: Client-side visual feedback immediately
      // You'll need to tie this into the game state updates from Firebase
      // For now, let's keep it minimal as Firebase will update.
      // The `showBonk` and `lastWhackedIndex` need to be set based on Firebase updates.
    } catch (error) {
      console.error('Error whacking mole:', error)
      // Firebase will likely handle concurrency, but you might get an error if another player
      // whacked it simultaneously. The `whackedBy` check in the Cloud Function is key.
    }
  } else {
    console.log('No unwhacked mole at this index or game not playing.')
    // Optional: deduct points for wrong whack if implemented
    // await update(dbRef(db, `rooms/${roomId.value}/players/${user.uid}/score`), (score || 0) - 1);
  }
}

onMounted(() => {
  if (roomId.value) {
    onValue(molesRef.value, (snapshot) => {
      const molesData = snapshot.val()
      if (molesData) {
        currentVisibleMoles.value = molesData
        console.log('Current moles from Firebase:', molesData)
      } else {
        currentVisibleMoles.value = {}
      }
    })
  }
})

//first in list is the vip
//vip generates a string in the beginning of the game that tells them where the moles are and which ones are bombs?
//whatever
//then firebase starts sending the moles to people
//give the moles ids so that way once its clicked, it gets poofed instantly
</script>

<style scoped></style>
