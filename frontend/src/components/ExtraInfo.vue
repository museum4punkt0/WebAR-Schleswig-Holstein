<script setup>
  import { ref, computed } from 'vue'
  const props = defineProps({
    mainText: {
      type: String,
      default: '',
    },
    subText: {
      type: String,
      default: '',
    },
  })

  const showSubtext = ref(false)

  const mainTextWithSpace = computed(() => {
    return props.mainText + ' '
  })

  function toggleSubtext() {
    showSubtext.value = !showSubtext.value
  }
</script>

<template>
  <div class="extra-info-container">
    <div
      class="extra-info-main-text"
      @click="toggleSubtext"
      @keypress="toggleSubtext"
    >
      <h2 class="main-text" :class="{ visible: showSubtext }">
        {{ mainTextWithSpace }}
      </h2>
    </div>
    <p :class="{ visible: showSubtext }" class="subtext">{{ subText }}</p>
  </div>
</template>

<style scoped>
  .extra-info-container {
    width: 100%;
    padding: var(--gutter) var(--gutter) 0 var(--gutter);
    margin-top: calc(-1 * var(--gutter));
    margin-left: calc(-1 * var(--gutter));
    color: black;
    background-color: white;
  }

  .main-text {
    position: relative;
    z-index: 2;
    display: block;
    background-color: white;
  }

  .main-text::after {
    display: inline-block;
    width: calc(2rem * var(--h2-scale-factor) / 1.5);
    height: calc(2rem * var(--h2-scale-factor) / 1.5);
    margin: 0;
    vertical-align: baseline;
    content: '';
    background-image: url('@/assets/icons/chevron-down.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
  }

  .main-text.visible::after {
    transform: rotateZ(180deg);
  }

  .subtext {
    position: relative;
    z-index: 1;
    display: block;
    margin: 0;
    margin-top: var(--gutter);
    font-size: 0;
    opacity: 0;

    /* 
    In order to animate the component height as the subtext is animated
    down, we use this 'font-size' scaling trick (since we don't know exactly
    the height of the subtext, and therefore can't animate height directly):
    */
    /* stylelint-disable-next-line max-line-length */
    transition: font-size 0.5s ease 0.5s, opacity 0.5s ease, transform 0.5s ease;
    transform: translateY(-100%);
  }

  .subtext.visible {
    font-size: 1rem;
    opacity: 1;
    /* stylelint-disable-next-line max-line-length */
    transition: font-size 0.5s ease, opacity 0.5s ease 0.5s,
      transform 0.5s ease 0.5s;
    transform: translateY(0);
  }
</style>
