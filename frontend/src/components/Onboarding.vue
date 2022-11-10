<script setup>
  import { ref, computed, onMounted, onBeforeUnmount, inject } from 'vue'

  import Button from '@/components/Button.vue'
  import { useI18n } from 'vue-i18n'

  import { useSettingsStore } from '@/stores/settings'

  const settings = useSettingsStore()

  defineProps({})

  const currStep = ref(1)
  const windowWidth = ref(0)

  const { t } = useI18n()

  const emit = defineEmits(['close'])

  const cookies = inject('$cookies')

  const steps = computed(() => {
    const stepsArray = []

    for (let step = 1; step <= 4; step += 1) {
      stepsArray.push({
        imgSrc: new URL(
          `../assets/images/onboarding/step${step}.svg`,
          import.meta.url
        ).href,

        imgAltText: t(`components.onboarding.step${step}.imgAltText`),
        text: t(`components.onboarding.step${step}.text`),
        nextButtonLabel: t(`components.onboarding.step${step}.nextButtonLabel`),
        prevButtonLabel: t(`components.onboarding.step${step}.prevButtonLabel`),
      })
    }

    return stepsArray
  })

  onMounted(() => {
    windowWidth.value = window.innerWidth
    window.onresize = () => {
      windowWidth.value = window.innerWidth
      calcStepsTransform()
    }
  })

  onBeforeUnmount(() => {
    window.onresize = null
  })

  function handleClose() {
    if (settings.cookiesAccepted && !cookies.get('onboarded')) {
      cookies.set('onboarded', true)
    }
    emit('close')
  }

  function setPrevStep() {
    currStep.value -= 1
  }

  function setNextStep() {
    if (currStep.value < 4) {
      currStep.value += 1
    } else {
      if (settings.cookiesAccepted && !cookies.get('onboarded')) {
        cookies.set('onboarded', true)
      }
      emit('close')
    }
  }

  function calcStepsTransform() {
    if (windowWidth.value <= 1024)
      return (currStep.value - 1) * windowWidth.value * -1
    else return (currStep.value - 1) * 1024 * -1
  }
</script>

<template>
  <div class="onboarding-container">
    <div class="upper-bar">
      <h3>{{ currStep }} / {{ steps.length }}</h3>
      <Button
        type="icon-close-white"
        class="close-button"
        @click="handleClose"
      />
    </div>
    <div
      class="steps-container"
      :style="{
        transform: `translateX(${calcStepsTransform()}px)`,
      }"
    >
      <div class="step-container">
        <img :src="steps[0].imgSrc" :alt="steps[0].imgAltText" />
        <p>{{ steps[0].text }}</p>
        <div class="step-buttons-container first">
          <Button
            type="secondary"
            :label="steps[0].nextButtonLabel"
            :options="['next-icon']"
            class="step-button"
            @click="setNextStep"
          />
        </div>
      </div>
      <div class="step-container">
        <img :src="steps[1].imgSrc" :alt="steps[1].imgAltText" />
        <p>{{ steps[1].text }}</p>
        <div class="step-buttons-container">
          <Button
            type="secondary"
            :label="steps[1].prevButtonLabel"
            :options="['back-icon']"
            class="step-button"
            @click="setPrevStep"
          />
          <Button
            type="secondary"
            :label="steps[1].nextButtonLabel"
            :options="['next-icon']"
            class="step-button"
            @click="setNextStep"
          />
        </div>
      </div>
      <div class="step-container">
        <img :src="steps[2].imgSrc" :alt="steps[2].imgAltText" />
        <p>{{ steps[2].text }}</p>
        <div class="step-buttons-container">
          <Button
            type="secondary"
            :label="steps[2].prevButtonLabel"
            :options="['back-icon']"
            class="step-button"
            @click="setPrevStep"
          />
          <Button
            type="secondary"
            :label="steps[2].nextButtonLabel"
            :options="['next-icon']"
            class="step-button"
            @click="setNextStep"
          />
        </div>
      </div>
      <div class="step-container">
        <img :src="steps[3].imgSrc" :alt="steps[3].imgAltText" />
        <p>{{ steps[3].text }}</p>
        <div class="step-buttons-container">
          <Button
            type="secondary"
            :label="steps[3].prevButtonLabel"
            :options="['back-icon']"
            class="step-button"
            @click="setPrevStep"
          />
          <Button
            type="secondary"
            :label="steps[3].nextButtonLabel"
            :options="['next-icon', 'smaller-font-size']"
            class="step-button"
            @click="setNextStep"
          />
        </div>
      </div>
    </div>
    <div class="bottom-bar">
      <button class="skip-button" @click="handleClose">
        {{ t('components.onboarding.skipButtonLabel') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
  * {
    --num-onboarding-steps: 4;
    --light-gray: rgb(200 200 200);
    --progress-indicator-size: 7px;
  }

  .onboarding-container {
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
    align-items: center;
    justify-content: flex-start;
    width: calc(100% - (var(--gutter) * 2));
    max-width: var(--max-width);
    height: calc(100vh - var(--gutter) * 2);
    padding: var(--gutter);
    margin: 0;
    color: white;
    background-color: var(--tertiary-color);
  }

  .upper-bar,
  .bottom-bar {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .upper-bar {
    justify-content: flex-start;
  }

  .upper-bar h3 {
    margin: 10px 0 0 10px;
  }

  .bottom-bar {
    justify-content: center;
    margin-bottom: 25%;
  }

  .close-button,
  .progress-indicator {
    margin-left: auto;
  }

  .steps-container {
    display: flex;
    flex-wrap: nowrap;
    gap: calc(var(--gutter) * 2);
    align-items: center;
    align-self: flex-start;
    justify-content: flex-start;
    width: calc(
      var(--num-onboarding-steps) * 100vw +
        (var(--gutter) * var(--num-onboarding-steps) * 2)
    );
    height: 100%;
    transition: transform 0.5s ease-in-out;
  }

  .step-container {
    display: flex;
    flex: 0 0 calc(100vw - (var(--gutter) * 2));
    flex-direction: column;
    gap: 2.5%;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
  }

  .step-container p {
    max-width: calc(var(--max-width) - 200px);
    text-align: center;
  }

  .step-container img {
    height: 50%;
    max-height: 550px;
  }

  .step-buttons-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    margin: 3vh 0;
  }

  .step-buttons-container.first {
    justify-content: center;
  }

  .step-button {
    max-width: 400px;
  }

  .skip-button {
    padding: 0;
    margin: 0;
    font-family: var(--link-font);
    font-size: 1rem;
    color: var(--light-gray);
    background-color: transparent;
    border: 0;
  }

  @media screen and (min-width: 1024px) {
    .steps-container {
      width: calc((var(--max-width) * 4) - (var(--gutter) * 8));
    }

    .step-container {
      flex: 0 0 calc(var(--max-width) - (var(--gutter) * 2));
    }
  }

  @media screen and (min-width: 768px) {
    .bottom-bar {
      margin-bottom: 10%;
    }
  }

  @media screen and (min-width: 640px) {
    .step-button {
      width: 40%;
    }

    .step-buttons-container {
      justify-content: space-around;
      width: 100%;
      margin: 3vh 0;
    }
  }

  @media screen and (min-height: 1280px) {
    .step-container {
      justify-content: center;
    }
  }

  @media screen and (max-height: 580px) {
    .step-container img {
      height: 40%;
      max-height: 250px;
    }

    .step-container {
      max-height: 350px;
    }
  }
</style>
