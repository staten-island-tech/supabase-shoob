//pinia file

import { defineStore } from 'pinia'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth'
import { auth } from '../../firebaseConfig'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    authReady: false,
    storeError: null,
    //all temp null or false
  }),

  actions: {
    async initAuth() {
      // onAuthStateChanged is a listener that fires when the user's sign-in state changes.
      // it also fires once when the listener is attached, providing the initial state.
      onAuthStateChanged(auth, (user) => {
        this.user = user // update the user state in the store based on Firebase's response
        this.authReady = true // mark auth as ready after the initial check
        console.log('Firebase Auth State Changed:', user ? user.email : 'No user')
      })
    },

    async registerUser(email, password) {
      this.storeError = null
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password) //automatically comes with uid, email, and things
        //above is literally all the code we need
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

    /* function monitorAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('user is signed in:', user.email)
    } else {
      console.log('user is signed out')
    }
  })
} */

    async logoutUser() {
      this.storeError = null
      try {
        await signOut(auth)
        console.log('signed out')
        router.push('/')
      } catch (error) {
        console.error('sign out error:', error.message)
        this.storeError = error.message
        throw error
      }
    },
  },
})

//export { registerUser, loginUser, logoutUser }
