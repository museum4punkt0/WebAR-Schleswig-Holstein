<script setup>
  import { ref } from 'vue'
  import Button from '@/components/Button.vue'
  defineProps({
    text: {
      type: String,
      default: '',
    },
    gltfModelSrc: {
      type: String,
      default: '',
    },
    usdzModelSrc: {
      type: String,
      default: '',
    },
    soundSrc: {
      type: String,
      default: '',
    },
  })
</script>

<template>
  <div class="ar-cta-container">
    <h3>{{ text }}</h3>
    <img
      src="@/assets/icons/ar-black.svg"
      :alt="$t('components.arCallToAction.arIconAltText')"
    />
    <Button
      :label="$t('pages.station.arButtonLabel')"
      type="ar-primary"
      :gltf-model-src="gltfModelSrc"
      :usdz-model-src="usdzModelSrc"
      :sound-src="soundSrc"
      class="ar-cta-button"
    />
  </div>
</template>

<style scoped>
  .ar-cta-container h3 {
    color: black;
    text-align: center;
  }

  .ar-cta-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: var(--max-width);
    padding: var(--gutter);
    margin: 0 calc(-1 * var(--gutter));
    margin-bottom: var(--components-gap);
    color: black;
    background-color: white;
  }

  .ar-cta-container img {
    margin: calc(var(--gutter) * 3);
  }

  .button-icon-container {
    position: fixed;
    right: var(--gutter);
    bottom: var(--gutter);
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
  }

  .ar-cta-button {
    width: 100%;
    max-width: var(--max-button-width);
  }
</style>
