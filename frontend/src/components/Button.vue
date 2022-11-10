<script setup>
  import { computed, ref, toRefs, onMounted, onBeforeUnmount } from 'vue'

  import { marked } from 'marked'

  import { useI18n } from 'vue-i18n'

  import { useARStore } from '@/stores/ar'

  const props = defineProps({
    type: {
      type: String,
      default: 'primary',
    },
    label: {
      type: String,
      default: '',
    },
    route: {
      type: String,
      default: null,
    },
    gltfModelSrc: {
      type: String,
      required: false,
      default: '',
    },
    usdzModelSrc: {
      type: String,
      required: false,
      default: '',
    },
    soundSrc: {
      type: String,
      required: false,
      default: '',
    },
    arBannerLink: {
      type: String,
      required: false,
      default: '',
    },
    options: {
      type: Array,
      required: false,
      default: () => [],
    },
  })

  const { type, gltfModelSrc, usdzModelSrc, arBannerLink, soundSrc, options } =
    toRefs(props)

  const arStore = useARStore()

  const { t } = useI18n()

  const iosARAnchor = ref(null)

  const buttonClass = computed(() => {
    let classString = `button ${type.value}`
    if (type.value.includes('icon')) {
      classString = `icon-button ${type.value}`
    }
    if (options.value.includes('dropShadow')) {
      classString += ' drop-shadow'
    }
    if (options.value.includes('round')) {
      classString += ' round'
    }
    if (
      options.value.includes('smaller-font-size') &&
      window.innerWidth <= 400
    ) {
      classString += ` smaller-font-size`
    }
    return classString
  })

  const androidARLink = computed(() => {
    // First, setup link to .gltf/glb file:
    const basicUrl =
      'intent://arvr.google.com/scene-viewer/1.0?' +
      `file=${gltfModelSrc.value}`
    // Second, add options to the intent.
    // See https://developers.google.com/ar/develop/scene-viewer#3d-or-ar
    // for more info.
    const mode = 'ar_only'
    let arOptions = `&mode=${mode}` + `&resizable=${true}`

    if (soundSrc.value) {
      arOptions += `&sound=${soundSrc.value}`
    }

    if (arBannerLink.value) {
      arOptions +=
        `&link=${arBannerLink.value}` +
        `&title=${t('components.button.arBanner.title')}`
    }

    arOptions +=
      '#Intent;scheme=https;' +
      'package=com.google.ar.core;' +
      'action=android.intent.action.VIEW;' +
      `S.browser_fallback_url=${
        window.location.protocol +
        '//' +
        window.location.host +
        '/ar-error' +
        ';end;'
      }`

    return basicUrl + arOptions
  })

  const iosARLink = computed(() => {
    // First, setup link to .usdz file:
    const basicUrl = usdzModelSrc.value

    // Second, add options to the intent.
    // Check https://developer.apple.com/documentation/arkit/adding_an_apple_pay_button_or_a_custom_action_in_ar_quick_look
    // Also check https://cwervo.com/writing/quicklook-web/ for practical
    // details on how to launch AR Quick Look from the web.
    const allowScaling = true

    let arOptions = `#allowsContentScaling=${allowScaling ? '1' : '0'}`

    if (arBannerLink.value) {
      const iosBannerTitle = t('components.button.arBanner.title')
      const iosBannerText = t('components.button.arBanner.text')
      const iosBannerBtnLabel = t('components.button.arBanner.buttonLabel')
      arOptions +=
        `&checkoutTitle=${encodeURIComponent(iosBannerTitle)}` +
        `&checkoutSubtitle=${encodeURIComponent(iosBannerText)}` +
        `&callToAction=${encodeURIComponent(iosBannerBtnLabel)}` +
        `&canonicalWebPageURL=${arBannerLink.value}`
    }

    return basicUrl + arOptions
  })

  const arNotAvailableTitle = t('components.button.arNotAvailable.title')
  const arNotAvailableText = marked(t('components.button.arNotAvailable.text'))

  function handleAnchorMessages(event) {
    if (event.data == '_apple_ar_quicklook_button_tapped') {
      window.location.href = arBannerLink.value
    }
  }

  onMounted(() => {
    if (iosARAnchor.value)
      iosARAnchor.value.addEventListener('message', handleAnchorMessages, false)
  })

  onBeforeUnmount(() => {
    if (iosARAnchor.value)
      iosARAnchor.value.removeEventListener(
        'message',
        handleAnchorMessages,
        false
      )
  })
</script>

<template>
  <div
    v-if="type === 'ar-primary' || type === 'ar-secondary'"
    class="ar-button-container"
  >
    <a
      v-if="arStore.os === 'iOS'"
      ref="iosARAnchor"
      rel="ar"
      :href="iosARLink"
      class="ar-button"
      :class="buttonClass"
    >
      <img
        :alt="$t('components.button.arPreviewImgAltText')"
        class="dummy-ios-ar-preview-img"
      />
      <span>{{ label }}</span>
    </a>
    <a
      v-else-if="arStore.os === 'Android'"
      :href="androidARLink"
      class="ar-button"
      :class="buttonClass"
      >{{ label }}</a
    >
    <div v-else class="ar-not-supported-message-container" :class="buttonClass">
      <h4>{{ arNotAvailableTitle }}</h4>
      <p class="ar-not-supported-message" v-html="arNotAvailableText"></p>
    </div>
  </div>
  <div v-else-if="type.includes('icon')" :class="buttonClass">
    <router-link v-if="route" :to="route"> </router-link>
  </div>
  <div v-else>
    <router-link v-if="route" :to="route" :class="buttonClass">
      <span v-if="options.includes('back-icon')" class="inline-icon-container">
        <img
          v-if="type === 'primary'"
          src="@/assets/icons/chevron-left-black.svg"
          alt=""
          class="icon-back"
        />
        <img
          v-if="type === 'secondary'"
          src="@/assets/icons/chevron-left-white.svg"
          alt=""
          class="icon-back"
        />
      </span>
      {{ label }}
      <span v-if="options.includes('next-icon')" class="inline-icon-container">
        <img
          v-if="type === 'primary'"
          src="@/assets/icons/chevron-left-black.svg"
          alt=""
          class="icon-next"
        />
        <img
          v-if="type === 'secondary'"
          src="@/assets/icons/chevron-left-white.svg"
          alt=""
          class="icon-next"
        />
      </span>
    </router-link>
    <button v-else-if="options.includes('back-icon')" :class="buttonClass">
      <span class="inline-icon-container">
        <img
          v-if="type === 'primary'"
          src="@/assets/icons/chevron-left-black.svg"
          alt=""
          class="icon-back"
        />
        <img
          v-if="type === 'secondary'"
          src="@/assets/icons/chevron-left-white.svg"
          alt=""
          class="icon-back"
        />
      </span>
      {{ label }}
    </button>
    <button v-else-if="options.includes('next-icon')" :class="buttonClass">
      {{ label }}
      <span class="inline-icon-container">
        <img
          v-if="type === 'primary'"
          src="@/assets/icons/chevron-left-black.svg"
          alt=""
          class="icon-next"
        />
        <img
          v-if="type === 'secondary'"
          src="@/assets/icons/chevron-left-white.svg"
          alt=""
          class="icon-next"
        />
      </span>
    </button>
    <button v-else :class="buttonClass">{{ label }}</button>
  </div>
</template>

<style scoped>
  * {
    --button-icon-size: 56px;
  }

  .button,
  .ar-button {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 68px;
    padding: calc(var(--gutter) / var(--font-scale-factor));
    font-family: var(--button-font);
    font-size: calc(1rem * var(--button-label-scale-factor));
    text-decoration: none;
    cursor: pointer;
    border: none;
  }

  a,
  button {
    text-align: center;
    word-wrap: break-word;
  }

  .primary {
    color: var(--button-primary-color);
    background: var(--button-primary-bg-color);
    outline: 4px solid var(--button-primary-color);
    outline-offset: -4px;
  }

  .ar-primary,
  .ar-secondary {
    background: var(--button-primary-bg-color);
  }

  .ar-primary {
    color: var(--button-primary-color);
    outline: 4px solid var(--button-primary-color);
    outline-offset: -4px;
  }

  .ar-secondary {
    color: var(--button-secondary-color);
    outline: 4px solid var(--button-secondary-color);
    outline-offset: -4px;
  }

  .secondary {
    color: var(--button-secondary-color);
    background: var(--button-secondary-bg-color);
    outline: 4px solid var(--button-secondary-color);
    outline-offset: -4px;
  }

  .ar-button-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .round {
    border-radius: 50%;
  }

  .drop-shadow {
    box-shadow: 0 3px 6px rgb(0 0 0 / 30%);
  }

  .icon-button,
  .icon-button::after,
  .icon-button a {
    display: block;
    width: var(--button-icon-size);
    height: var(--button-icon-size);
  }

  .icon-button::before {
    content: '';
  }

  .icon-stations {
    background-color: white;
    background-image: url('@/assets/icons/station-icon.svg');
    background-repeat: no-repeat;
    background-position: center;
  }

  .icon-qr-scan {
    background-color: white;
    background-image: url('@/assets/icons/qr-icon.svg');
    background-repeat: no-repeat;
    background-position: center;
  }

  .icon-close {
    background-color: white;
    background-image: url('@/assets/icons/close-icon.svg');
    background-repeat: no-repeat;
    background-position: center;
  }

  .icon-close-white {
    background-color: transparent;
    background-image: url('@/assets/icons/close-icon-white.svg');
    background-repeat: no-repeat;
    background-position: center;
  }

  .icon-next {
    margin-left: 10px;
    transform: rotateZ(180deg);
  }

  .icon-back {
    margin-right: 10px;
  }

  .inline-icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ar-not-supported-message-container {
    display: inline-block;
    height: auto;
    padding: var(--gutter);
  }

  .smaller-font-size {
    font-size: 0.85rem;
  }

  .dummy-ios-ar-preview-img {
    display: none;
  }
</style>
