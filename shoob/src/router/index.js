import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

// Import your components (pages) here
import LoginPage from '../views/LoginPage.vue';
import GameLobby from '../views/GameLobby.vue';
import GameRoom from '../views/GameRoom.vue';
import PlayerProfile from '../view/PlayerProfile.vue'

const routes = [
  {
    path: '/',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/lobby',
    name: 'GameLobby',
    component: GameLobby
  },
  {
    path: '/game/:gameId',
    name: 'GameRoom',
    component: GameRoom,
    props: true // Allows passing the gameId as a prop to the GameRoom component
  },
  {
    path: '/profile/:profileId',
    name: 'PlayerProfile',
    component: PlayerProfile,
    props: true
  }
];

const router = createRouter({
    history: createWebHistory(),  // Vue 3 uses history mode by default
    routes,
  });
  
  export default router;