import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth, db } from '../../firebaseConfig' // <-- Make sure 'db' is imported here
import { ref as dbRef, get, update, remove } from 'firebase/database' // <-- Import Realtime Database functions
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    authReady: false,
    storeError: null,
  }),

  actions: {
    async initAuth() {
      onAuthStateChanged(auth, (user) => {
        this.user = user
        this.authReady = true
        console.log('Firebase Auth State Changed:', user ? user.email : 'No user')
      })
    },

    async registerUser(email, password) {
      this.storeError = null
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        console.log('registered:', user)
      } catch (error) {
        console.error('register error:', error.message)
        this.storeError = error.message
        throw error
      }
    },

    async loginUser(email, password) {
      try {
        this.storeError = null
        await setPersistence(auth, browserLocalPersistence)
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        console.log('logged in:', user.email)
      } catch (error) {
        console.error('login error:', error.message)
        this.storeError = error.message
        throw error
      }
    },

    async logoutUser() {
      this.storeError = null
      try {
        const currentUser = auth.currentUser // Get the current user BEFORE signing out

        if (currentUser) {
          console.log(`User ${currentUser.uid} attempting to leave all rooms before logout.`)
          const allRoomsSnapshot = await get(dbRef(db, 'rooms')) // Get all rooms
          const allRoomsData = allRoomsSnapshot.val()

          if (allRoomsData) {
            // Iterate through all rooms to find where the user is a player
            for (const roomId in allRoomsData) {
              const room = allRoomsData[roomId]
              // Check if the current user exists in this room's players list
              if (room.players && room.players[currentUser.uid]) {
                console.log(`Found user ${currentUser.uid} in room ${roomId}. Leaving now.`)

                const playerRef = dbRef(db, `rooms/${roomId}/players/${currentUser.uid}`)
                const playersRef = dbRef(db, `rooms/${roomId}/players`)
                const roomRef = dbRef(db, `rooms/${roomId}`)

                await remove(playerRef) // Remove the player from this specific room

                // After removal, check if the room is now empty
                const updatedPlayersSnapshot = await get(playersRef)
                const playersInRoomAfterRemoval = updatedPlayersSnapshot.val()

                if (
                  !playersInRoomAfterRemoval ||
                  Object.keys(playersInRoomAfterRemoval).length === 0
                ) {
                  // If room is empty, delete the room itself
                  await remove(roomRef)
                  console.log(`Room ${roomId} deleted as it's empty after logout.`)
                } else {
                  // If the logging-out user was the host, reassign host to another player
                  if (room.hostId === currentUser.uid) {
                    const remainingPlayerUids = Object.keys(playersInRoomAfterRemoval)
                    if (remainingPlayerUids.length > 0) {
                      // Assign the first remaining player as the new host
                      await update(roomRef, { hostId: remainingPlayerUids[0] })
                      console.log(
                        `Host ${currentUser.uid} left room ${roomId}. New host: ${remainingPlayerUids[0]}`,
                      )
                    } else {
                      // This case should ideally be covered by room deletion if no players are left
                      // but as a fallback, explicitly remove hostId
                      await update(roomRef, { hostId: null })
                    }
                  }
                  console.log(
                    `User ${currentUser.uid} left room ${roomId}. Room still has players.`,
                  )
                }
              }
            }
          }
        }

        // Finally, sign out from Firebase Authentication
        await signOut(auth)
        console.log('signed out')
        router.push('/') // Redirect to the home/lobby page
      } catch (error) {
        console.error('sign out error:', error.message)
        this.storeError = error.message
        throw error
      }
    },
  },
})
