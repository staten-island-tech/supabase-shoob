// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCNEjQxESJUs_q34J5jtyzhjJLyeRcNVA8',
  authDomain: 'shoob-98995.firebaseapp.com',
  projectId: 'shoob-98995',
  storageBucket: 'shoob-98995.firebasestorage.app',
  messagingSenderId: '554603640038',
  appId: '1:554603640038:web:dcd4e6caca7a3467483727',
  measurementId: 'G-7LK6XEJ5KZ',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
const db = getDatabase(app)
const auth = getAuth(app)

export { db, auth }
