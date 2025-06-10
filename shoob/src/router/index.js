import { createRouter, createWebHistory } from 'vue-router'

import GameView from '../views/GameView.vue'
import GameRoom from '../views/LobbyView.vue'
import LoginPage from '../views/LoginPage.vue'
import PlayerProfile from '../views/PlayerProfile.vue'
import { auth } from '../../firebaseConfig.js'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/gameroom',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      //for when someone joins a room, figure out how to attach a unique id to it? or just consolidate it with lobby? or just make this the actual room when the game is running
      path: '/gameroom',
      name: 'gameroom',
      component: GameRoom,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: PlayerProfile,
      meta: { requiresAuth: true },
    },
    {
      path: '/game/:roomId',
      name: 'game',
      component: GameView,
      props: true,
    },
  ],
})

// A flag to ensure onAuthStateChanged only sets up the initial navigation once
// This prevents infinite loops or multiple redirects on initial load
let isFirebaseInitialized = false

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (!requiresAuth) {
    next()
    return
  }

  if (!isFirebaseInitialized) {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        isFirebaseInitialized = true
        unsubscribe()

        if (user) {
          resolve(next())
        } else {
          resolve(next('/login'))
        }
      })
    })
  } else {
    const user = auth.currentUser
    if (user) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
