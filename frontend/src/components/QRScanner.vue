<script setup>
  import { ref, onMounted, onBeforeUnmount, watch, toRefs } from 'vue'
  import { useRouter } from 'vue-router'
  import QrScanner from 'qr-scanner'

  import Button from '@/components/Button.vue'
  import Onboarding from '@/components/Onboarding.vue'

  /* eslint-disable vuejs-accessibility/media-has-caption */

  const props = defineProps({
    onboarded: {
      type: Boolean,
      default: false,
    },
  })

  const { onboarded } = toRefs(props)

  const router = useRouter()
  const origin = window.location.origin

  const qrScanVideo = ref(null)
  const qrScanner = ref(null)
  const isScanning = ref(null)
  const showOnboarding = ref(false)

  const emit = defineEmits(['close', 'onboarded'])

  onMounted(() => {
    qrScanner.value = new QrScanner(qrScanVideo.value, handleQRCodeScan, {
      returnDetailedScanResult: true,
      maxScansPerSecond: 10,
    })

    if (!onboarded.value) {
      showOnboarding.value = true
      isScanning.value = false
    } else isScanning.value = true
  })

  onBeforeUnmount(() => {
    isScanning.value = false
    if (qrScanner.value) {
      qrScanner.value.stop()
      qrScanner.value.destroy()
      qrScanner.value = null
    }
  })

  watch(
    () => isScanning.value,
    () => {
      if (isScanning.value && qrScanner.value) {
        qrScanner.value.start()
      }

      if (!isScanning.value && qrScanner.value) {
        qrScanner.value.stop()
      }
    }
  )

  const handleQRCodeScan = (result) => {
    if (result.data.includes(origin)) {
      router.push(result.data.split(origin)[1])
    }
  }

  function handleClose() {
    emit('close')
  }

  function closeOnboarding() {
    showOnboarding.value = false
    isScanning.value = true
    emit('onboarded')
  }
</script>

<template>
  <div class="qr-scanner-container">
    <div class="qr-scanner-wrapper">
      <Button
        type="icon-close"
        class="close-button"
        :options="['round', 'dropShadow']"
        @click="handleClose"
      />
      <div class="qr-target">
        <img
          src="@/assets/icons/qr-scan.svg"
          :alt="$t('components.qrScanner.imgAltText')"
        />
      </div>
      <video ref="qrScanVideo" class="qr-scanner-video"></video>
    </div>
    <Onboarding
      class="onboarding-container"
      :class="{ closed: !showOnboarding }"
      @close="closeOnboarding"
    />
  </div>
</template>

<style scoped>
  .qr-scanner-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    max-width: var(--max-width);
    height: 100vh;
    padding: 0;
    overflow: hidden;
    background-color: var(--tertiary-color);
  }

  .close-button {
    position: absolute;
    top: var(--gutter);
    right: var(--gutter);
    z-index: 2;
    width: 50px;
    height: 50px;
  }

  .qr-scanner-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--tertiary-color);
  }

  .qr-target {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;
    width: auto;
    height: auto;
    transform: translate(-50%, -50%);
  }

  .qr-target img {
    object-fit: contain;
    width: 100%;
    height: 100%;
  }

  .qr-scanner-video {
    position: absolute;
    top: 50%;
    left: 50%;
    min-height: 100%;

    /*
      Unfortunately here '!important' is needed since the QrScanner
      library also uses a transform property, which here needs to be
      overridden:
    */
    transform: translate(-50%, -50%) scaleX(1) !important;
  }

  .onboarding-container {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: calc(100% - (var(--gutter) * 2));
    visibility: visible;
    opacity: 1;
    transition: opacity 0.3s ease-in-out, visibility 0.6s ease-in-out;
  }

  .onboarding-container.closed {
    visibility: hidden;
    opacity: 0;
  }
</style>
