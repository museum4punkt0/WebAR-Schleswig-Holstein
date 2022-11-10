<script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import Panzoom from '@panzoom/panzoom'

  import VLazyImage from 'v-lazy-image'

  import Button from '@/components/Button.vue'

  defineProps({
    stationName: {
      type: String,
      default: '',
    },
    mapImageSrc: {
      type: String,
      default: '',
    },
    mapImageAltText: {
      type: String,
      default: '',
    },
  })

  const panzoomWrapper = ref(null)
  const panzoom = ref(null)
  const emit = defineEmits(['close'])

  onMounted(() => {
    panzoom.value = Panzoom(panzoomWrapper.value, {
      maxScale: 3,
      minScale: 1,
      contain: 'outside',
    })

    panzoom.value.zoom(1, {
      animate: true,
    })

    panzoomWrapper.value.addEventListener('wheel', panzoom.value.zoomWithWheel)
  })

  onBeforeUnmount(() => {
    panzoomWrapper.value.removeEventListener(
      'wheel',
      panzoom.value.zoomWithWheel
    )
  })

  function handleClose() {
    emit('close')
  }
</script>

<template>
  <div class="view-container">
    <h2>{{ stationName }}</h2>
    <div class="map-container">
      <div ref="panzoomWrapper" class="panzoom-wrapper">
        <v-lazy-image
          :src="mapImageSrc"
          :alt="mapImageAltText"
          class="map-image"
        />
      </div>
    </div>
    <Button
      :label="$t('components.mapViewer.backButtonLabel')"
      type="primary"
      :options="['back-icon']"
      class="back-button"
      @click="handleClose"
    />
  </div>
</template>

<style scoped>
  .view-container {
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    padding: 0;
  }

  .view-container h2 {
    align-self: flex-start;
    margin-top: 56px;
  }

  .map-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(100% + (var(--gutter) * 2));
    height: 55%;
    background-color: rgb(246 246 246);
  }

  .panzoom-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .map-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .back-button {
    width: 100%;
    max-width: var(--max-button-width);
    margin-bottom: 25%;
  }

  @media screen and (min-width: 768px) {
    .back-button {
      margin-bottom: 10%;
    }
  }
</style>
