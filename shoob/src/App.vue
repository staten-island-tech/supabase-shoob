<script setup>
import { RouterLink, RouterView } from 'vue-router'
import PlayerProfile from './views/PlayerProfile.vue'

/*IDEAS:
Whack a mole
special mole gives currency, which you can spend with keybinds to sabotage other person
turn other persons screen a different color
special mole you have to prioritize or you explode
*/
</script>

<template>
  <div class="stuff">
    <header>
      <div class="wrapper">
        <nav></nav>
      </div>
    </header>

    <RouterView />
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

.stuff {
  background-color: white;
}
</style>
