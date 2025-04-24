import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebaseConfig'

async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password) //automatically comes with uid, email, and things
    //above is literally all the code we need
    const user = userCredential.user
    console.log('registered:', user)
  } catch (error) {
    console.error('register error:', error.message)
  }
}

async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user
    console.log('logged in:', user.email)
  } catch (error) {
    console.error('login error:', error.message)
  }
}

function monitorAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('user is signed in:', user.email)
    } else {
      console.log('user is signed out')
    }
  })
}

async function logoutUser() {
  try {
    await signOut(auth)
    console.log('signed out')
  } catch (error) {
    console.error('sign out error:', error.message)
  }
}

export { registerUser, loginUser }
