<template>
  <div class="container">
    <div v-if="paused === 0" class="game">
      <p>score: {{ score }} ability points: {{ abilityPoints }}</p>
      <button
        @click="
          gameStatus = 1;
          score = 0;
          createRat();
        "
      >
        Start
      </button>
      <button @click="gameStatus = 0">End</button>
      <button @click="setGrids(4)">4x4</button>
      <button @click="setGrids(5)">5x5</button>
      <button @click="setGrids(6)">6x6</button>
      <button @click="((paused = 1), createMathProblem())">Math Problem</button>
      <div
        class="grid"
        :style="{
          gridTemplateColumns: `repeat(${gridDim}, 1fr)`,
          gridTemplateRows: `repeat(${gridDim}, 1fr)`,
        }"
      >
        <div v-for="(hole, index) in holes" :key="index" class="hole" @click="whack(index)">
          <img v-if="ratIndex === index" alt="Rat" class="rat" src="/bigrat.png" />
          <img
            v-if="specialRatIndex === index && random == 1"
            alt="Special Rat"
            class="rat"
            src="/bigratBlue.png"
          />
        </div>
      </div>
    </div>
    <div v-else-if="paused === 1" class="mathProblem">
      <p>{{ mathProblem }}</p>
      <input
        type="text"
        ref="inputBox"
        v-model="userAnswer"
        class="mathInput"
        placeholder="Type right value to continue"
      />
    </div>
  </div>
</template>

<script setup>

/*  NOTES :
- Hide the "header" in app if the game is playing to recenter the page (invisible element)
- Sabotage that creates random string of words to be typed?
*/

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const gameStatus = ref(0)
const paused = ref(0)
const score = ref(0)
const abilityPoints = ref(0)
const gridDim = ref(0)
const gridSize = ref(0)
const holes = ref()
const ratIndex = ref()
const specialRatIndex = ref()
const random = ref(0)
const newRatIndexes = ref([0, 0])
const userAnswer = ref('') //v-model will create a string so it should be parsed
const correctAnswer = ref()
const mathProblem = ref('')
const inputBox = ref(null)

onMounted(() => {
  window.addEventListener('keydown', keybind)
})

onUnmounted(() => {
  window.removeEventListener('keydown', keybind)
})

function setGrids(value) {
  gridDim.value = value
  gridSize.value = value ** 2
  holes.value = Array(gridSize.value).fill(null)
  ratIndex.value = Math.floor(Math.random() * gridSize.value)
  createRat()
}

function createRat() {
  generateRandomIndexes()
  ratIndex.value = newRatIndexes.value[0]
  specialRatIndex.value = newRatIndexes.value[1]
  random.value = Math.floor(Math.random() * 12)         //special rat spawn rate
}

function generateRandomIndexes() {
  const indexes = new Set() //using a set prevents duplicates so we don't need to filter out two different unique indexes
  while (indexes.size < 2) {
    const tryIndex = Math.floor(Math.random() * gridSize.value)
    if (tryIndex !== ratIndex.value && tryIndex !== specialRatIndex.value) {
      indexes.add(tryIndex)
    }
  }
  newRatIndexes.value = Array.from(indexes)
  console.log(newRatIndexes.value)
}

function whack(index) {
  if (gameStatus.value == 1) {
    if (index === ratIndex.value) {
      score.value++
      abilityPoints.value++
      createRat()
    }
    if (index === specialRatIndex.value) {
      score.value++
      abilityPoints.value += 5
      createRat()
    }
  }
}

function createMathProblem() {
  if (abilityPoints.value > 20) {
    abilityPoints.value-=20
    paused.value = 1
    userAnswer.value = ''
    const v1 = Math.floor(Math.random() * 29)
    const v2 = Math.floor(Math.random() * 29)
    mathProblem.value = `${v1} + ${v2} =\u00A0` //space that doesn't get trimmed by browser
    correctAnswer.value = v1 + v2
    nextTick(() => {
      //waits for DOM to load, "selects" textbox for user
      inputBox.value?.focus()
    })
  }
}

watch(userAnswer, (value) => {
  if (parseInt(value) == correctAnswer.value) {
    paused.value = 0
  }
})

function keybind(input) {
  if (input.key == 'm') {
    input.preventDefault()
    createMathProblem()
  }
}

setGrids(4)
</script>

<style scoped>
.game {
}

.rat {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-auto-rows: minmax(50px, auto);
  gap: 20px;
  justify-content: center;
}

.hole {
  background-color: #123412;
  width: 100px;
  height: 100px;
}

.mathProblem {
  display: flex;
  flex-direction: row;
}
</style>
