<script setup>
  import { ref, computed, isProxy, toRaw } from 'vue'
  import VLazyImage from 'v-lazy-image'
  import Button from '@/components/Button.vue'

  import { useI18n } from 'vue-i18n'

  const props = defineProps({
    question: {
      type: String,
      default: '',
    },
    answers: {
      type: Array,
      default: () => [],
    },
    image: {
      type: Object,
      default: () => {},
    },
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
  })

  const selectedAnswer = ref(null)
  const tries = ref(0)
  // Possible quiz states are 'unanswered', 'toBeChecked', 'correct', 'incorrect'
  const quizState = ref('unanswered')

  const production = import.meta.env.PROD

  const { t } = useI18n()

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  const buttonLabel = computed(() => {
    if (tries.value === 0) return t('components.quiz.buttonLabel.confirm')
    else return t('components.quiz.buttonLabel.tryAgain')
  })

  function selectAnswer(answer) {
    selectedAnswer.value = answer
    quizState.value = 'toBeChecked'
  }

  function checkAnswer() {
    if (selectedAnswer.value === null) {
      return
    } else {
      tries.value++
      if (
        selectedAnswer.value ===
        props.answers.filter((answer) => answer.correct)[0].text
      ) {
        quizState.value = 'correct'
        tries.value = 0
      } else {
        quizState.value = 'incorrect'
      }
    }
  }

  function generateImgSrcset(formatsObj) {
    let formats = formatsObj
    if (isProxy(formatsObj)) {
      formats = toRaw(formatsObj)
    }

    let srcset = ''
    const numFormats = Object.keys(formats).length - 1
    let index = 0
    for (const format in formats) {
      let imgUrl = formats[format].url
      imgUrl = `${
        production
          ? import.meta.env.VITE_ASSETS_BASE_URL
          : devAssetsBaseUrl.value
      }${imgUrl}`
      const width = `${formats[format].width}w`
      const srcsetEntry = imgUrl + ' ' + width
      srcset += srcsetEntry
      if (index < numFormats) srcset += ', '
      index += 1
    }

    return srcset
  }

  function getDefaultImgSrc(formatsObj) {
    let formats = formatsObj
    if (isProxy(formatsObj)) {
      formats = toRaw(formatsObj)
    }

    let imgUrl = formats.thumbnail.url
    if (formats.small) imgUrl = formats.small.url
    if (formats.medium) imgUrl = formats.medium.url

    imgUrl = `${
      production ? import.meta.env.VITE_ASSETS_BASE_URL : devAssetsBaseUrl.value
    }${imgUrl}`

    return imgUrl
  }
</script>

<template>
  <div class="quiz-container">
    <div class="quiz-question-container">
      <h2>{{ question }}</h2>
      <div
        v-for="(answer, index) in answers"
        :key="index"
        class="answer-option"
        :class="{
          checked:
            (quizState === 'unanswered' || quizState === 'toBeChecked') &&
            selectedAnswer === answer.text,
          incorrect:
            quizState === 'incorrect' && selectedAnswer === answer.text,
          correct: quizState === 'correct' && selectedAnswer === answer.text,
        }"
      >
        <label
          :for="answer.id"
          :class="{ checked: selectedAnswer === answer.text }"
        >
          <input
            :id="answer.id"
            type="radio"
            name="answer"
            :value="answer.text"
            :checked="selectedAnswer === answer.text"
            @change="selectAnswer(answer.text)"
          />
          <span
            class="custom-radio"
            :class="{
              incorrect:
                quizState === 'incorrect' && selectedAnswer === answer.text,
              correct:
                quizState === 'correct' && selectedAnswer === answer.text,
            }"
          ></span>
          {{ answer.text }}
        </label>
      </div>
    </div>
    <Button
      v-if="quizState !== 'correct'"
      type="primary"
      :label="buttonLabel"
      class="check-answer-button"
      @click="checkAnswer"
    />
    <div v-if="quizState === 'correct'" class="quiz-text">
      <v-lazy-image
        :src="getDefaultImgSrc(image.formats)"
        :alt="image.alternativeText"
        :srcset="generateImgSrcset(image.formats)"
      />
      <h2>{{ title }}</h2>
      <p>{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
  /* ---------------------------- Variables --------------------------------- */
  * {
    --radio-button-size: 22px;
  }

  .quiz-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    color: black;
  }

  .quiz-question-container {
    width: 100%;
  }

  .quiz-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .quiz-text {
    width: 100%;
    padding: var(--gutter);
  }

  .quiz-text h2 {
    margin: var(--gutter) 0;
    word-wrap: break-word;
  }

  .answer-option {
    position: relative;
    display: flex;
    flex-flow: row;
    align-items: center;
    padding: var(--gutter) 0;
    font-family: 'OpenSans Regular', sans-serif;
    font-size: 1rem;
  }

  .answer-option:first-of-type {
    margin-top: var(--gutter);
  }

  .answer-option:last-of-type {
    margin-bottom: var(--gutter);
  }

  .answer-option label {
    margin-left: calc(var(--radio-button-size) + (var(--gutter) * 2));
  }

  .answer-option.checked {
    background-color: rgb(242 242 242);
  }

  .answer-option.incorrect {
    background-color: rgb(241 208 203);
  }

  .answer-option.correct {
    background-color: rgb(206 228 195);
  }

  .answer-option input {
    position: absolute;
    width: 0;
    height: 0;
    cursor: pointer;
    opacity: 0;
  }

  .custom-radio {
    position: absolute;
    top: 50%;
    left: 0;
    box-sizing: border-box;
    width: var(--radio-button-size);
    height: var(--radio-button-size);
    margin-left: var(--gutter);
    background-color: white;
    border: 2px solid var(--light-color);
    border-radius: 50%;
    transform: translateY(-50%);
  }

  .custom-radio::after {
    position: absolute;
    display: none;
    content: '';
  }

  .answer-option .custom-radio::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background-color: var(--primary-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .answer-option .custom-radio.incorrect::after,
  .answer-option .custom-radio.incorrect::before {
    position: absolute;
    left: 50%;
    display: block;
    width: 10px;
    height: 10px;
    content: '';
    background-color: transparent;
    border-left: 2px solid black;
    border-radius: 0;
  }

  .answer-option .custom-radio.incorrect::after {
    transform: translate(-22%, -10%) rotate(45deg);
  }

  .answer-option .custom-radio.incorrect::before {
    transform: translate(-22%, 10%) rotate(-45deg);
  }

  .answer-option .custom-radio.correct::after {
    position: absolute;
    top: 40%;
    left: 50%;
    display: inline-block;
    width: 5px;
    height: 10px;
    background-color: transparent;
    border-right: 2px solid rgb(120 177 63);
    border-bottom: 2px solid rgb(120 177 63);
    border-radius: 0;
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .answer-option input:checked ~ .custom-radio {
    box-sizing: border-box;
    background-color: white;
    border: 2px solid var(--primary-color);
  }

  .answer-option input:checked ~ .custom-radio.correct {
    border: 2px solid rgb(120 177 63);
  }

  .answer-option input:checked ~ .custom-radio.incorrect {
    border: 2px solid rgb(238 76 54);
  }

  .answer-option input:checked ~ .custom-radio::after {
    display: block;
  }

  .answer-option label.checked {
    font-family: 'OpenSans Bold', sans-serif;
  }

  .check-answer-button {
    width: 100%;
    max-width: var(--max-button-width);
  }
</style>
