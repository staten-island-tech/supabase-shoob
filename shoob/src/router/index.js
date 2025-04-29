import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import HomeView from '../views/GameLobby.vue'
import GameRoom from '../views/GameRoom.vue'
import LoginPage from '../views/LoginPage.vue'
import { auth } from '../../firebaseConfig.js'
import { onAuthStateChanged } from 'firebase/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      // to see all avaliable rooms
      path: '/lobby',
      name: 'lobby',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/GameLobby.vue'),
      meta: { requiresAuth: true },
    },
    {
      //for when someone joins a room, figure out how to attach a unique id to it? or just consolidate it with lobby? or just make this the actual room when the game is running
      path: '/gameroom',
      name: 'gameroom',
      component: GameRoom,
      meta: { requiresAuth: true },
    },
    {
      //
      path: '/profile',
      name: 'profile',
      component: GameRoom,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (!requiresAuth) {
    next()
    return
  }

  const user = auth.currentUser

  if (user) {
    next()
  } else {
    next('/login')
  }
})

export default router
