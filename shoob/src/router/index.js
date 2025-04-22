import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/GameLobby.vue'
import LoginPage from '../views/LoginPage.vue'
import GameRoom from '@/views/GameRoom.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'pluh',
      component: LoginPage,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/lobby',
      name: 'lobby',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/GameLobby.vue'),
    },
    {
      path: '/gameroom',
      name: 'gameroom',
      component: GameRoom,
    },
  ],
})

export default router
