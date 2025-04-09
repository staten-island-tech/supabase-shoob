import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebaseConfig'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user
    console.log('registered:', user)
  })
  .catch((error) => {
    console.error('rrror:', error.message)
  })

signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user
    console.log('logged in:', user.email)
  })
  .catch((error) => {
    console.error('login rrror:', error.message)
  })

//add pinia things below or firebase
onAuthStateChanged(auth, (user) => {
  if (user) {
  } else {
  }
})

signOut(auth).then(() => {
  console.log('signed out')
})
