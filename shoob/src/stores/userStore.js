import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../firebaseConfig'

export async function saveUserProfile(user) {
  const userRef = doc(db, 'users', user.uid)

  const existing = await getDoc(userRef)
  if (!existing.exists()) {
    await setDoc(userRef, {
      email: user.email,
      username: user.email,
      wins: 0,
      unlockedSkins: [],
      joinedAt: new Date(),
    })
  }
}

export async function incrementWins(uid) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, {
    wins: increment(1),
  })
}
