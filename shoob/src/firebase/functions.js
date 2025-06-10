// functions/index.js
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.database() // Use Realtime Database

// Function to handle mole whacks and score updates
exports.processMoleWhack = functions.database
  .ref('rooms/{roomId}/moles/{moleId}/whackedBy')
  .onWrite(async (change, context) => {
    // Only proceed if a value was written (not deleted) and it's not null (i.e., someone claimed it)
    if (!change.after.exists() || change.after.val() === null) {
      return null
    }

    const { roomId, moleId } = context.params
    const whackingPlayerId = change.after.val() // The UID of the player who whacked it
    const moleRef = change.after.ref.parent // Reference to the specific mole node

    // Use a transaction to ensure atomic update of score and mole state
    await moleRef.transaction((currentMole) => {
      // If the mole hasn't been whacked before (or was just set by this player in a transaction)
      // This is a simple concurrency check. Realtime Database transactions are good for this.
      if (currentMole && currentMole.whackedBy === whackingPlayerId) {
        // Prevent multiple players from scoring for the same whack in rapid succession
        // Check if `whackedBy` is the same as the one triggering this, or null
        // If currentMole.whackedBy is already set by another player, don't re-process.
        // This transaction will ensure only the first setter wins.

        // Get the mole data
        const moleType = currentMole.type || 'normal'
        const points = moleType === 'special' ? 5 : 1

        // Update player's score
        const playerScoreRef = db.ref(`rooms/${roomId}/players/${whackingPlayerId}/score`)
        playerScoreRef.transaction((currentScore) => {
          return (currentScore || 0) + points
        })

        // Update player's ability points
        const playerAbilityRef = db.ref(`rooms/${roomId}/players/${whackingPlayerId}/abilityPoints`)
        playerAbilityRef.transaction((currentAbilityPoints) => {
          return (currentAbilityPoints || 0) + (moleType === 'special' ? 5 : 1)
        })

        // Mark the mole as processed (e.g., set a flag or delete it here)
        // For simple deletion:
        moleRef.remove() // Delete the mole node from the database

        console.log(`Mole ${moleId} whacked by ${whackingPlayerId}. Awarded ${points} points.`)
        return currentMole // Return the original mole data to complete the transaction (or null to abort)
      } else if (
        currentMole &&
        currentMole.whackedBy !== null &&
        currentMole.whackedBy !== whackingPlayerId
      ) {
        // Mole was whacked by someone else, do nothing
        console.log(
          `Mole ${moleId} was already whacked by ${currentMole.whackedBy}. Player ${whackingPlayerId} was too late.`,
        )
        return null // Abort the transaction
      }
      return null // If currentMole is null or already processed
    })

    return null
  })

// Cloud Function for Host-initiated mole generation (if you want to offload it from client)
// You can use a scheduled function or an HTTP callable function triggered by the host client.
// Or, keep it client-side for the host as in the previous example.
exports.generateMoles = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.',
    )
  }
  const { roomId, gridDim } = data
  const userId = context.auth.uid

  const roomRef = db.ref(`rooms/${roomId}`)
  const molesRef = db.ref(`rooms/${roomId}/moles`)

  const roomSnapshot = await roomRef.once('value')
  const roomData = roomSnapshot.val()

  if (!roomData || roomData.hostId !== userId || roomData.gameState !== 'playing') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only the host can generate moles when the game is playing.',
    )
  }

  // --- Mole generation logic (similar to client-side, but authoritative) ---
  const currentGridSize = gridDim ** 2
  const random = Math.floor(Math.random() * 12)
  const moleType = random === 1 ? 'special' : 'normal'
  const moleIndex = Math.floor(Math.random() * currentGridSize) // For simplicity, no previous index check here

  const newMoleData = {
    index: moleIndex,
    type: moleType,
    createdAt: admin.database.ServerValue.TIMESTAMP, // Use server timestamp for accuracy
    whackedBy: null,
  }

  await molesRef.push(newMoleData)
  return { success: true, message: `Generated ${moleType} mole at ${moleIndex}` }
})
