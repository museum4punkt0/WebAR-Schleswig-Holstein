<script setup>
  import {
    ref,
    computed,
    onBeforeMount,
    onMounted,
    onBeforeUnmount,
    inject,
    toRaw,
    isProxy,
  } from 'vue'

  import { useRoute, useRouter } from 'vue-router'

  import { useI18n } from 'vue-i18n'

  import VLazyImage from 'v-lazy-image'

  import { marked } from 'marked'

  import Loading from '@/components/Loading.vue'
  import Button from '@/components/Button.vue'
  import StationsOverview from '@/components/StationsOverview.vue'
  import QRScanner from '@/components/QRScanner.vue'
  import VideoPlayer from '@/components/VideoPlayer.vue'
  import AudioPlayer from '@/components/AudioPlayer.vue'
  import CookieBanner from '@/components/CookieBanner.vue'

  import { useMuseumStore } from '@/stores/museum'
  import { useSettingsStore } from '@/stores/settings'

  import imgInstructions1 from '@/assets/images/ar_instructions/step1.svg'
  import imgInstructions2 from '@/assets/images/ar_instructions/step2.svg'
  import imgInstructions3 from '@/assets/images/ar_instructions/step3.svg'
  import imgInstructions4 from '@/assets/images/ar_instructions/step4.svg'

  const museumStore = useMuseumStore()
  const settings = useSettingsStore()

  const route = useRoute()
  const museumSlug = ref('')
  const onboarded = ref(false)

  const router = useRouter()

  const cookies = inject('$cookies')

  const numInstructionsSteps = 4

  const showStationsOverlay = ref(false)
  const showQRScanner = ref(false)
  const scrollPosition = ref(0)

  const { t } = useI18n()

  const production = import.meta.env.PROD

  onBeforeMount(() => {
    setupPage()
  })

  onMounted(() => {
    settings.$subscribe((mutation, state) => {
      // If current museum content language does not match the language setting,
      // update museum data:
      if (
        museumStore.currentMuseumData &&
        museumStore.currentMuseumData.locale !== settings.locale
      ) {
        const newMuseumSlug =
          museumStore.currentMuseumData.localizations.data.filter(
            (localization) => {
              return localization.attributes.locale === settings.locale
            }
          )[0]?.attributes?.slug
        const newRoute = '/' + newMuseumSlug
        router.push(newRoute)
        updatePage(newMuseumSlug)
      }
    })

    if (cookies.get('cookies')) {
      settings.setCookiesAccepted(true)
    }

    if (settings.cookiesAccepted && cookies.get('onboarded')) {
      onboarded.value = true
    }

    if (window.scrollY > 0) {
      window.scrollTo(0, 0)
    }
  })

  onBeforeUnmount(() => {
    if (showStationsOverlay.value) toggleOverlay('stations')
    if (showQRScanner.value) toggleOverlay('qr-scanner')
  })

  const isContentLoaded = computed(() => {
    return (
      museumStore.currentMuseumData &&
      Object.keys(museumStore.currentMuseumData).length > 0
    )
  })

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  // ----------------------- Welcome page header content -----------------------

  const welcomeImgSrc = computed(() =>
    getDefaultImgSrc(
      museumStore.currentMuseumData.welcome_image.data.attributes.formats
    )
  )

  const welcomeImgSrcset = computed(() =>
    generateImgSrcset(
      museumStore.currentMuseumData.welcome_image.data.attributes.formats
    )
  )

  const welcomeImgAltText = computed(() => {
    if (
      museumStore.currentMuseumData.welcome_image.data.attributes
        .alternativeText
    ) {
      return museumStore.currentMuseumData.welcome_image.data.attributes
        .alternativeText
    } else return t('pages.welcome.welcomeImageAltText')
  })

  const welcomeTitle = computed(
    () => museumStore.currentMuseumData.welcome_page.title
  )

  const welcomeText = computed(
    () => museumStore.currentMuseumData.welcome_page.text
  )

  // ------------ Deutsche Gebärdensprache welcome page content ----------------

  const dgsVideoSrc = computed(() => {
    if (
      museumStore.currentMuseumData.welcome_page?.dgs_video?.data?.attributes
        ?.url
    ) {
      return production
        ? import.meta.env.VITE_ASSETS_BASE_URL +
            museumStore.currentMuseumData.welcome_page.dgs_video.data.attributes
              .url
        : devAssetsBaseUrl.value +
            museumStore.currentMuseumData.welcome_page.dgs_video.data.attributes
              .url
    } else return null
  })

  const dgsVideoMime = computed(
    () =>
      museumStore.currentMuseumData.welcome_page.dgs_video.data.attributes.mime
  )

  // ---------------- Audio description welcome page content -------------------

  const audioDescriptionSrc = computed(
    () =>
      museumStore.currentMuseumData.welcome_page.audio_description.data
        .attributes.url
  )

  const audioDescriptionMime = computed(
    () =>
      museumStore.currentMuseumData.welcome_page.audio_description.data
        .attributes.mime
  )

  const audioDescriptionTitle = computed(() => {
    if (museumStore.currentMuseumData.welcome_page.audio_description_title)
      return museumStore.currentMuseumData.welcome_page.audio_description_title
    else return t('pages.welcome.defaultAudioDescriptionTitle')
  })

  const audioDescriptionText = computed(() => {
    if (museumStore.currentMuseumData.welcome_page.audio_description_text)
      return museumStore.currentMuseumData.welcome_page.audio_description_text
    else return t('pages.welcome.defaultAudioDescriptionText')
  })

  // -------------------------- Related museums --------------------------------

  const relatedMuseums = computed(() => {
    if (museumStore.relatedMuseumsData) {
      return museumStore.relatedMuseumsData?.map((museum) => {
        return {
          name: museum.attributes.name,
          slug: museum.attributes.slug,
          imageFormats: museum.attributes.welcome_image.data.attributes.formats,
        }
      })
    } else return []
  })

  // ------------------------------ Stations -----------------------------------

  const stations = computed(() => {
    return museumStore.currentMuseumData?.stations?.data?.map((station) => {
      return {
        title: station.attributes.title,
        slug: station.attributes.slug,
        imageFormats: station.attributes.image.data.attributes.formats,
        imageAltText: station.attributes.image.data.attributes.alternativeText
          ? station.attributes.image.data.attributes.alternativeText
          : t('components.stationsOverview.imageDefaultAltText'),
        location: station.attributes.location,
        mapImageSrc: station.attributes.map_image.data.attributes.url,
        mapImageAltText: station.attributes.map_image.data.attributes
          .alternativeText
          ? station.attributes.map_image.data.attributes.alternativeText
          : t('components.mapViewer.imageDefaultAltText'),
        route: `/${museumStore.currentMuseumData.slug}/${station.attributes.slug}`,
      }
    })
  })

  // ----------------------------- Functions -----------------------------------

  async function fetchMuseumData(museumSlug, locale = 'all') {
    await museumStore.getMuseum(museumSlug, locale).then((response) => {
      if (
        // Check content contains necessary data:
        response?.welcome_image?.data?.attributes &&
        response?.welcome_page?.title &&
        response?.welcome_page?.text &&
        response?.footer
      ) {
        // Set museum data in Store:
        museumStore.setCurrentMuseumData(response)
      } else {
        console.error('Welcome page data is not consistent')
        router.push('/error')
      }
    })
  }

  async function fetchAllMuseumsData(locale) {
    await museumStore.getAllMuseums(locale).then((response) => {
      if (response) {
        const relatedMuseumsData = response.filter(
          (museum) =>
            museum.attributes?.slug !== museumStore.currentMuseumData?.slug
        )
        // Set museum data in Store:
        museumStore.setRelatedMuseumsData(relatedMuseumsData)
      } else
        console.error(
          'Error fetching museums data: response returned ' + response
        )
    })
  }

  function setupPage() {
    museumStore.setCurrentMuseumData(undefined)
    museumStore.setRelatedMuseumsData(undefined)
    museumSlug.value = route.path.split('/')[1]

    fetchMuseumData(museumSlug.value).then(() => {
      // If museum data does not match current set language, change it.
      // This probably should not be done here, ideally language
      // handling should be done in the SettingsMenu component.

      if (museumStore.currentMuseumData?.locale !== settings.locale) {
        settings.setLocale(museumStore.currentMuseumData.locale)
      }

      fetchAllMuseumsData(settings.locale).then(() => {
        // Also, if language setting in cookies don't match the current museum
        // language, change it.
        checkCookiesLanguage()
      })

      if (window.scrollY > 0) {
        window.scrollTo(0, 0)
      }
    })
  }

  function updatePage(museumSlug) {
    museumStore.setCurrentMuseumData(undefined)
    museumStore.setRelatedMuseumsData(undefined)

    fetchMuseumData(museumSlug, settings.locale).then(() => {
      fetchAllMuseumsData(settings.locale)

      if (window.scrollY > 0) {
        window.scrollTo(0, 0)
      }
    })
  }

  function checkCookiesLanguage() {
    if (cookies.isKey('locale')) {
      const localeSetting = JSON.parse(cookies.get('locale'))
      if (settings.locale !== localeSetting) {
        settings.setLocale(localeSetting)
      }
    }
  }

  function getInstructionsImgSrc(step) {
    switch (step) {
      case 1:
        return imgInstructions1
      case 2:
        return imgInstructions2
      case 3:
        return imgInstructions3
      case 4:
        return imgInstructions4
    }
  }

  function toggleOverlay(overlay) {
    if (overlay === 'stations')
      showStationsOverlay.value = !showStationsOverlay.value
    if (overlay === 'qr-scanner') showQRScanner.value = !showQRScanner.value

    const body = document.querySelector('body')

    // Prevent body vertical scrolling when menu is open:
    if (showStationsOverlay.value || showQRScanner.value) {
      scrollPosition.value = window.pageYOffset
      body.style.overflow = 'hidden'
      body.style.position = 'fixed'
      body.style.top = `-${scrollPosition.value}px`
      body.style.width = '100%'
    } else {
      body.style.removeProperty('overflow')
      body.style.removeProperty('position')
      body.style.removeProperty('top')
      body.style.removeProperty('width')
      window.scrollTo(0, scrollPosition.value)
    }
  }

  function setOnboarded() {
    onboarded.value = true
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

  function parseMarkdown(markdown) {
    return marked(markdown)
  }
</script>

<template>
  <div v-if="isContentLoaded" class="view-container">
    <CookieBanner v-if="settings.cookiesAccepted === undefined" />

    <div class="welcome-image-container">
      <v-lazy-image
        :src="welcomeImgSrc"
        :alt="welcomeImgAltText"
        :srcset="welcomeImgSrcset"
      />
    </div>

    <div class="welcome-text-container">
      <h1>{{ welcomeTitle }}</h1>
      <p>{{ welcomeText }}</p>
    </div>

    <VideoPlayer
      v-if="settings.dgs && dgsVideoSrc"
      :src="dgsVideoSrc"
      :file-mime="dgsVideoMime"
      :options="['hideVolumeButton']"
    />

    <AudioPlayer
      v-if="settings.audioDescription && audioDescriptionSrc"
      :src="audioDescriptionSrc"
      :file-mime="audioDescriptionMime"
      :title="audioDescriptionTitle"
      :text="audioDescriptionText"
    />

    <div class="ar-instructions-container">
      <h2>{{ $t('pages.welcome.arInstructions.title') }}</h2>
      <div
        v-for="step in numInstructionsSteps"
        :key="step"
        class="instructions-step"
      >
        <img
          :src="getInstructionsImgSrc(step)"
          :alt="$t(`pages.welcome.arInstructions.step${step}.iconAltText`)"
        />
        <div
          v-if="
            $t(`pages.welcome.arInstructions.step${step}.text`).includes('http')
          "
          class="instructions-step-markdown"
          v-html="
            parseMarkdown($t(`pages.welcome.arInstructions.step${step}.text`))
          "
        ></div>
        <p v-else>
          {{ $t(`pages.welcome.arInstructions.step${step}.text`) }}
        </p>
      </div>
      <Button
        type="secondary"
        :label="$t('pages.welcome.qrScannerButtonLabel')"
        class="qr-scanner-button"
        @click="toggleOverlay('qr-scanner')"
      />
    </div>

    <div
      v-if="relatedMuseums && relatedMuseums.length > 0"
      class="related-museums-container"
    >
      <div>
        <h3>{{ $t('pages.welcome.relatedMuseums.title') }}</h3>
        <p>{{ $t('pages.welcome.relatedMuseums.text') }}</p>
      </div>
      <div
        v-for="(museum, index) in relatedMuseums"
        :key="index"
        class="related-museum-card"
      >
        <div class="related-museum-card-image-title-container">
          <div class="related-museum-card-image-container">
            <v-lazy-image
              :src="getDefaultImgSrc(museum.imageFormats)"
              :alt="`${$t('pages.welcome.relatedMuseums.museumImageAltText')} ${
                museum.name
              }`"
              :srcset="generateImgSrcset(museum.imageFormats)"
            />
            <button
              class="related-museum-link"
              @click="updatePage(museum.slug)"
            ></button>
          </div>
          <h4>{{ museum.name }}</h4>
        </div>
        <Button
          type="primary"
          :label="$t('pages.welcome.relatedMuseums.discoverButtonLabel')"
          :route="`/${museum.slug}`"
          class="related-museum-card-button"
          @click="updatePage(museum.slug)"
        />
      </div>
    </div>

    <div class="icon-buttons-container">
      <Button
        :class="{
          hidden: showStationsOverlay || showQRScanner,
        }"
        type="icon-stations"
        class="icon-button"
        :options="['round', 'dropShadow']"
        @click="toggleOverlay('stations')"
      />
      <Button
        type="icon-qr-scan"
        :class="{ hidden: showQRScanner }"
        class="icon-button"
        :options="['round', 'dropShadow']"
        @click="toggleOverlay('qr-scanner')"
      />
    </div>

    <transition name="slide">
      <StationsOverview
        v-if="showStationsOverlay"
        :stations="stations"
        class="stations-container"
        @close="toggleOverlay('stations')"
      />
    </transition>

    <transition name="slide">
      <QRScanner
        v-if="showQRScanner"
        class="qr-scanner-container"
        :onboarded="onboarded"
        @close="toggleOverlay('qr-scanner')"
        @onboarded="setOnboarded"
      />
    </transition>
  </div>
  <Loading v-else />
</template>

<style scoped>
  /* ---------------------------- View Container ---------------------------- */

  .view-container {
    display: flex;
    flex-direction: column;
    gap: var(--components-gap);
    align-items: center;
    justify-content: flex-start;
    padding-top: 0;
    padding-bottom: 0;
  }

  /* ------------------------- Welcome image & text ------------------------- */

  .welcome-image-container {
    display: flex;
    align-items: center;
    width: calc(100% + (var(--gutter) * 2));
    height: 100%;
    max-height: 400px;
    margin: 0 calc(var(--gutter) * -1);
    overflow: hidden;
  }

  .welcome-image-container img {
    width: 100%;
    height: 100%;
    min-height: 300px;
    object-fit: cover;
  }

  .welcome-text-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 100%;
  }

  h1 {
    max-width: var(--max-width);
  }

  /* --------------------------- AR instructions ---------------------------- */

  .ar-instructions-container {
    display: flex;
    flex-direction: column;
    gap: 7vh;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 7vh var(--gutter);
    margin: 0 calc(var(--gutter) * -1);
    color: white;
    background-color: var(--tertiary-color);
  }

  .instructions-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: var(--max-width);
  }

  .instructions-step img {
    width: 100%;
    max-width: 200px;
    height: 100%;
    max-height: 250px;
    object-fit: contain;
  }

  .instructions-step p {
    max-width: calc(var(--max-width) - 30%);
    text-align: center;
  }

  .qr-scanner-button {
    width: 100%;
    max-width: var(--max-button-width);
  }

  /* ----------- Icon buttons (bottom right corner of screen) --------------- */

  .icon-buttons-container {
    position: fixed;
    right: var(--gutter);
    bottom: var(--gutter);
    z-index: 97;
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
  }

  .icon-button {
    display: block;
    transition: opacity 0.3s ease-in-out, visibility 0.6s ease-in-out;
  }

  .icon-button.hidden {
    visibility: hidden;
    opacity: 0;
  }

  /* --------------------------- Related museums ---------------------------- */

  .related-museums-container {
    display: flex;
    flex-direction: column;
    gap: 5vh;
    max-width: 100%;
    margin-bottom: var(--components-gap);
  }

  .related-museums-container h3,
  .related-museums-container p {
    text-align: center;
  }

  .related-museum-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    height: fit-content;
  }

  .related-museum-card-image-title-container {
    border: 4px solid var(--tertiary-color);
  }

  .related-museum-card-image-container {
    display: grid;
    width: 100%;
    height: 56.25vw;
    max-height: 400px;
    overflow: hidden;
  }

  .related-museum-card img {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .related-museum-link {
    z-index: 3;
    display: block;
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    opacity: 0;
  }

  .related-museum-card h4 {
    margin: var(--gutter);
  }

  .related-museum-card-button {
    align-self: flex-end;
    width: calc(40% - var(--gutter) / var(--font-scale-factor) * 2);
    margin-top: -4px;
  }

  /* --------------- Station overview & QR Scanner overlays ----------------- */

  .stations-container {
    z-index: 98;
    width: calc(100% - (var(--gutter) * 2));
  }

  .qr-scanner-container {
    z-index: 98;
    width: 100vw;
  }

  .qr-scanner-container,
  .stations-container {
    position: fixed;
    top: 0;
    left: 0;
    max-width: var(--max-width);
    margin-top: 0;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: transform 0.5s ease-in-out;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateY(100vh);
  }

  @media screen and (min-width: 1024px) {
    .stations-container,
    .qr-scanner-container {
      left: calc((100vw - (var(--max-width))) / 2);
    }

    .icon-buttons-container {
      right: calc((100vw - (var(--max-width))) / 2 + var(--gutter));
    }
  }

  @media screen and (max-width: 550px) {
    .related-museum-card-button {
      align-self: center;
      width: 100%;
    }

    h1 {
      font-size: 10vw;
    }
  }
</style>
