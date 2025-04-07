
import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';  // Import the router configuration

createApp(App)
  .use(router)  // Use the router
  .mount('#app');  // Mount the app

