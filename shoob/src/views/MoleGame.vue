<template>
  <div class="container">
    <div v-if="paused === 0" class="game">
      <p>score: {{ score }} ability points: {{ abilityPoints }}</p>
      <button
        @click="
          gameStatus = 1;
          score = 0;
          abilityPoints = 0;
          createRat();
        "
      >
        Start
      </button>
      <button @click="endGame" >End</button>
      <button @click="setGrids(4)">4x4</button>
      <button @click="setGrids(5)">5x5</button>
      <button @click="setGrids(6)">6x6</button>
      <button @click="((paused = 1), createMathProblem())">Math Problem</button>
      <button @click="abilityPoints+=20">test ability points button</button>
      <div
        class="grid"
        :style="{
          gridTemplateColumns: `repeat(${gridDim}, 1fr)`,
          gridTemplateRows: `repeat(${gridDim}, 1fr)`,
        }"
      >
        <div v-for="(hole, index) in holes" :key="index" class="hole" @click="whack(index)">
          <img 
            v-if="ratIndex === index" 
            alt="Rat" 
            class="rat" 
            draggable="false" 
            src="/bigrat.png" />
          <img
            v-if="specialRatIndex === index && random == 1"
            alt="Special Rat"
            class="rat"
            draggable="false"
            src="/bigratBlue.png"
          />
          <img
            v-if="(prevRatIndex == index || (prevSpecialRatIndex == index)) && showBonk == 1"
            alt="bonk effect"
            class="rat"
            draggable="false"
            src="/bonk.avif"
          />  
          <img
            v-if="(prevRatIndex == index || (prevSpecialRatIndex == index)) && showBonk == 0"
            alt="poof effect"
            class="rat"
            draggable="false"
            src="/poof.png"
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
- Timer that gets rid of rats
- Freeze ability points gain button?
*/

import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const gameStatus = ref(0)
const paused = ref(0)
const score = ref(0)
const finalScore = ref(0)
const abilityPoints = ref(0)
const gridDim = ref(0)
const gridSize = ref(0)
const holes = ref()
const ratIndex = ref()
const specialRatIndex = ref()
const prevRatIndex = ref()
const prevSpecialRatIndex = ref()
const random = ref(0)
const randomTime = ref(0)
const newRatIndexes = ref([0, 0])
const whacked = ref(0)
const showBonk = ref()
const userAnswer = ref('') //v-model will create a string so it should be parsed
const correctAnswer = ref()
const doublePoints = ref(0)
const mathProblem = ref('')
const inputBox = ref(null)

let ratTimeout = null
let removeTimeout = null

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
  clearTimeout(ratTimeout)
  clearTimeout(removeTimeout)
  ratIndex.value = null
  specialRatIndex.value = null
  whacked.value = 0

  generateRandomTime(600, 200)
    ratTimeout = setTimeout(() => {
    showBonk.value = null
    generateRandomIndexes()
    ratIndex.value = newRatIndexes.value[0]
    specialRatIndex.value = newRatIndexes.value[1]
    random.value = Math.floor(Math.random() * 12)

    generateRandomTime(600,600)

    removeTimeout = setTimeout(() => {
      if (whacked.value === 0 && gameStatus.value == 1) {
        score.value--
        showBonk.value = 0
      }
      prevRatIndex.value = ratIndex.value
      if (random.value == 1) {
        prevSpecialRatIndex.value = specialRatIndex.value
      }
      else {
        prevSpecialRatIndex.value = null
      }
      ratIndex.value = null
      specialRatIndex.value = null
      createRat()
    }, randomTime.value)

  }, randomTime.value)
}

function generateRandomIndexes() {
  const indexes = new Set() //using a set prevents duplicates so we don't need to filter out two different unique indexes
  while (indexes.size < 2) {
    const tryIndex = Math.floor(Math.random() * gridSize.value)
    if (tryIndex !== prevRatIndex.value && tryIndex !== prevSpecialRatIndex.value) {
      indexes.add(tryIndex)
    }
  }
  newRatIndexes.value = Array.from(indexes)
  console.log(newRatIndexes.value)
}

function generateRandomTime(baseTime, min) {
  randomTime.value = Math.floor(Math.random() * baseTime
) + min
}

function whack(index) {
  if (gameStatus.value == 1) {
    if (index === ratIndex.value) {
      if (doublePoints.value == 0) {
        score.value++
      }
      else {
        score.value+=(doublePoints.value + 1)
      }
      abilityPoints.value++
      whacked.value = 1
      showBonk.value = 1
      prevRatIndex.value = ratIndex.value
      prevSpecialRatIndex.value = null
      createRat()
    }
    else if (index === specialRatIndex.value) {
      if (doublePoints.value == 0) {
        score.value++
      }
      else {
        score.value+=doublePoints.value
      }
      abilityPoints.value += 5
      whacked.value = 1
      showBonk.value = 1
      prevRatIndex.value = null
      prevSpecialRatIndex.value = specialRatIndex.value
      createRat()
    }
    else {
      score.value--
    }
  }
}

function createMathProblem() {
  if (abilityPoints.value >= 20) {
    abilityPoints.value -= 20
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

function doublePointCount() {
  if (abilityPoints.value >= 10) {
    abilityPoints.value -= 10
    doublePoints.value++
    setTimeout(() => {
      doublePoints.value = 0
    }, 8000);
  }
}

function endGame() {
  gameStatus.value = 0
  finalScore.value = score.value
  clearTimeout(ratTimeout)
  clearTimeout(removeTimeout)
  ratIndex.value = null
  specialRatIndex.value = null
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
  if (input.key == 'd') {
    input.preventDefault()
    doublePointCount()
  }
}

setGrids(4)
</script>

<style scoped>

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
  overflow: hidden;
}

.mathProblem {
  display: flex;
  flex-direction: row;
  font-size: xx-large;
}

.mathInput {
  font-size: x-large;
}

.hole:hover {
  background-color: rgb(213, 69, 69);
}

</style>
