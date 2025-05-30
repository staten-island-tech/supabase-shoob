<template>
  <div>
    <div class="grid">
      <div v-for="(hole, index) in holes"
      :key="index"
      class="hole"
      @click="whack(index)">
        <img
          v-if="moleIndex === index" 
          alt="Rat" 
          class="rat" src="/bigrat.png"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const score = ref('')


function createRat() {
  
  ratIndex = Math.floor(Math.random() * 9 /*num of holes in row*/)
}

function whack(index) {
  if (whackedIndex === ratIndex) {
    score++
    createRat()
  }

  /*if (index === this.moleIndex && this.gameRunning) {
        this.score++;
        this.moleIndex = null; // remove mole after hit
      }*/
}

//auto-fit makes as many columns as fits
//might needs to put bigrat.png into src/assets to make it usable in components?


/*<template>
  <div class="game">
    <h1>Whack-a-Mole</h1>
    <p>Score: {{ score }}</p>
    <div class="grid">
      <div 
        v-for="(hole, index) in holes" 
        :key="index" 
        class="hole"
        @click="whack(index)"
      >
        <img 
          v-if="moleIndex === index" 
          src="@/assets/mole.png" 
          alt="Mole" 
          class="mole" 
        />
      </div>
    </div>
    <button @click="startGame">Start Game</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      score: 0,
      moleIndex: null,
      holes: Array(9).fill(null),
      gameInterval: null,
      gameDuration: 10000,
      gameRunning: false
    };
  },
  methods: {
    startGame() {
      this.score = 0;
      this.gameRunning = true;
      this.spawnMole();
      setTimeout(() => {
        this.stopGame();
      }, this.gameDuration);
    },
    spawnMole() {
      this.gameInterval = setInterval(() => {
        this.moleIndex = Math.floor(Math.random() * this.holes.length);
      }, 700);
    },
    whack(index) {
      if (index === this.moleIndex && this.gameRunning) {
        this.score++;
        this.moleIndex = null; // remove mole after hit
      }
    },
    stopGame() {
      clearInterval(this.gameInterval);
      this.moleIndex = null;
      this.gameRunning = false;
      alert(`Game over! Your score: ${this.score}`);
    }
  }
};
</script>

<style scoped>
.game {
  text-align: center;
}
.grid {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
  justify-content: center;
  margin: 20px;
}
.hole {
  width: 100px;
  height: 100px;
  background: #ccc;
  border-radius: 10px;
  position: relative;
}
.mole {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}
</style>
*/
</script>

<style scoped>
.rat {
  width: 60px;
  height: 60px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  grid-auto-rows: minmax(50px, auto);
  gap: 20px;
}
.test {
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px;
  gap: 20px;
}
</style>
