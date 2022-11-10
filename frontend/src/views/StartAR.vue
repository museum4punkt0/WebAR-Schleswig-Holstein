<script setup>
  import {
    ref,
    computed,
    onBeforeMount,
    onBeforeUnmount,
    onMounted,
    inject,
  } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import { useI18n } from 'vue-i18n'
  import i18n from '@/i18n/i18n'

  import Button from '@/components/Button.vue'
  import Loading from '@/components/Loading.vue'
  import CookieBanner from '@/components/CookieBanner.vue'
  import AudioPlayer from '@/components/AudioPlayer.vue'
  import VideoPlayer from '@/components/VideoPlayer.vue'

  import StationsOverview from '@/components/StationsOverview.vue'
  import QRScanner from '@/components/QRScanner.vue'

  import { useMuseumStore } from '@/stores/museum'
  import { useStationStore } from '@/stores/station'
  import { useSettingsStore } from '@/stores/settings'

  const museumStore = useMuseumStore()
  const stationStore = useStationStore()
  const settings = useSettingsStore()

  const route = useRoute()
  const museumSlug = ref('')
  const stationSlug = ref('')

  const router = useRouter()

  const showStationsOverlay = ref(false)
  const showQRScanner = ref(false)
  const scrollPosition = ref(0)
  const onboarded = ref(false)

  const production = import.meta.env.PROD

  const cookies = inject('$cookies')

  const { t } = useI18n()

  // Fetch station data before mounting:
  onBeforeMount(async () => {
    museumSlug.value = route.path.split('/')[1]
    if (
      !museumStore.currentMuseumData ||
      museumStore.currentMuseumData?.slug !== museumSlug.value
    ) {
      fetchMuseumData(museumSlug.value).then(() => {
        // If museum data does not match current set language, change it.
        // This probably should not be done here, ideally language
        // handling should be done in the SettingsMenu component.
        if (museumStore.currentMuseumData?.locale !== settings.locale) {
          settings.$patch({ language: museumStore.currentMuseumData?.locale })
          i18n.global.locale = museumStore.currentMuseumData?.locale
        }

        fetchAllMuseumsData(settings.locale).then(() => {
          // Also, if language setting in cookies don't match the current museum
          // language, change it.
          checkCookiesLanguage()
        })
      })
    }

    stationSlug.value = route.path.split('/')[2]

    await fetchStationData()
  })

  onMounted(() => {
    settings.$subscribe((mutation, state) => {
      // If current station language does not match the language setting,
      // update station data:
      if (
        stationStore.currentStationData &&
        stationStore.currentStationData.locale !== settings.locale
      ) {
        stationSlug.value =
          stationStore.currentStationData.localizations.data.filter(
            (localizedStation) => {
              return localizedStation.attributes.locale === settings.locale
            }
          )[0]?.attributes?.slug

        museumSlug.value =
          museumStore.currentMuseumData.localizations.data.filter(
            (localizedMuseum) => {
              return localizedMuseum.attributes.locale === settings.locale
            }
          )[0]?.attributes?.slug

        updateMuseumData(museumSlug.value)

        const newRoute =
          '/' + museumSlug.value + '/' + stationSlug.value + '/ar'
        router.push(newRoute)

        fetchStationData()
      }
    })

    if (window.scrollY > 0) {
      window.scrollTo(0, 0)
    }

    if (cookies.get('cookies')) {
      settings.setCookiesAccepted(true)
    }

    if (settings.cookiesAccepted && cookies.get('onboarded')) {
      onboarded.value = true
    }
  })

  onBeforeUnmount(() => {
    if (showStationsOverlay.value) toggleOverlay('stations')
    if (showQRScanner.value) toggleOverlay('qr-scanner')
  })

  // Computed values to check and find data in response object:
  const isContentLoaded = computed(() => {
    return (
      stationStore.currentStationData &&
      Object.keys(stationStore.currentStationData).length > 0
    )
  })

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  // ---------------------------- Station AR data ------------------------------

  const stationARdata = computed(() => {
    if (
      stationStore.currentStationData.ar_experience &&
      stationStore.currentStationData.ar_experience.usdz_file.data.attributes
        .url &&
      stationStore.currentStationData.ar_experience.glb_gltf_file.data
        .attributes.url
    ) {
      return {
        text: stationStore.currentStationData.ar_experience.text,
        gltfModelSrc: production
          ? import.meta.env.VITE_ASSETS_BASE_URL +
            stationStore.currentStationData.ar_experience.glb_gltf_file.data
              .attributes.url
          : devAssetsBaseUrl.value +
            stationStore.currentStationData.ar_experience.glb_gltf_file.data
              .attributes.url,
        usdzModelSrc: production
          ? import.meta.env.VITE_ASSETS_BASE_URL +
            stationStore.currentStationData.ar_experience.usdz_file.data
              .attributes.url
          : devAssetsBaseUrl.value +
            stationStore.currentStationData.ar_experience.usdz_file.data
              .attributes.url,
        soundSrc: production
          ? import.meta.env.VITE_ASSETS_BASE_URL +
            stationStore.currentStationData.ar_experience.sound?.data
              ?.attributes?.url
          : devAssetsBaseUrl.value +
            stationStore.currentStationData.ar_experience.sound?.data
              ?.attributes?.url,
        // For the AR banner link, we remove the last three characters of the
        // current URL, so that the link points to the station page:
        arBannerLink: window.location.href.slice(0, -3),
      }
    } else return undefined
  })

  // --------------------- Deutsche Gebärdensprache video ----------------------

  const dgsVideoSrc = computed(() => {
    if (stationStore.currentStationData?.dgs_video?.data?.attributes?.url) {
      return production
        ? import.meta.env.VITE_ASSETS_BASE_URL +
            stationStore.currentStationData.dgs_video.data.attributes.url
        : devAssetsBaseUrl.value +
            stationStore.currentStationData.dgs_video.data.attributes.url
    } else return null
  })

  const dgsVideoMime = computed(() => {
    if (stationStore.currentStationData.dgs_video.data.attributes.mime)
      return stationStore.currentStationData.dgs_video.data.attributes.mime
    else return null
  })

  // ------------------------- Audio description -------------------------------

  const audioDescriptionSrc = computed(() => {
    if (
      stationStore.currentStationData?.audio_description?.data?.attributes?.url
    ) {
      return production
        ? import.meta.env.VITE_ASSETS_BASE_URL +
            stationStore.currentStationData.audio_description.data.attributes
              .url
        : devAssetsBaseUrl.value +
            stationStore.currentStationData.audio_description.data.attributes
              .url
    } else return null
  })

  const audioDescriptionMime = computed(
    () =>
      stationStore.currentStationData?.audio_description?.data?.attributes?.mime
  )

  const audioDescriptionTitle = computed(() => {
    if (stationStore.currentStationData?.audio_description_title)
      return stationStore.currentStationData.audio_description_title
    else return t('pages.station.defaultAudioDescriptionTitle')
  })

  const audioDescriptionText = computed(() => {
    if (stationStore.currentStationData?.audio_description_text)
      return stationStore.currentStationData.audio_description_text
    else return t('pages.station.defaultAudioDescriptionText')
  })

  // ------------------------------- Stations ----------------------------------

  const stations = computed(() => {
    return museumStore.currentMuseumData?.stations?.data
      ?.filter((station) => station.attributes.slug !== stationSlug.value)
      .map((station) => {
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

  // ------------------------------ Functions ----------------------------------

  function updateStation(newStationSlug) {
    stationSlug.value = newStationSlug
    fetchStationData()
  }

  async function fetchStationData() {
    await stationStore.getStationData(stationSlug.value).then((response) => {
      // If station data does not match current set language, change it.
      // This probably should not be done here, ideally language
      // handling should be done in the SettingsMenu component.
      if (response.locale !== settings.locale) {
        settings.setLocale(response.locale)
      }

      // Check response contains necessary data:
      if (
        response?.station_content?.length > 0 &&
        response?.ar_experience?.text &&
        response?.ar_experience?.glb_gltf_file?.data?.attributes?.url &&
        response?.ar_experience?.usdz_file?.data?.attributes?.url
      ) {
        stationStore.setCurrentStationData(response)
      } else {
        console.error('Station data is not consistent')
        router.push('/error')
      }
    })
  }

  function updateMuseumData(museumSlug) {
    museumStore.setCurrentMuseumData(undefined)
    museumStore.setRelatedMuseumsData(undefined)

    fetchMuseumData(museumSlug, settings.locale).then(() => {
      fetchAllMuseumsData(settings.locale)
    })
  }

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
      } else router.push('/error')
    })
  }

  async function fetchAllMuseumsData(locale) {
    await museumStore.getAllMuseums(locale).then((response) => {
      const relatedMuseumsData = response.filter(
        (museum) =>
          museum.attributes?.slug !== museumStore.currentMuseumData.slug
      )

      // Set museum data in Store:
      museumStore.setRelatedMuseumsData(relatedMuseumsData)
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
      if (overlay === 'stations') window.scrollTo(0, 0)
      else window.scrollTo(0, scrollPosition.value)
    }
  }

  function setOnboarded() {
    onboarded.value = true
  }
</script>

<template>
  <div v-if="isContentLoaded" class="view-container">
    <CookieBanner v-if="settings.cookiesAccepted === undefined" />
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
    <h3>{{ stationARdata.text }}</h3>
    <img
      src="@/assets/icons/ar-black.svg"
      :alt="$t('pages.startAR.arIconAltText')"
      class="ar-icon"
    />
    <Button
      type="ar-primary"
      :label="$t('pages.startAR.startButtonLabel')"
      :gltf-model-src="stationARdata.gltfModelSrc"
      :usdz-model-src="stationARdata.usdzModelSrc"
      :ar-banner-link="stationARdata.arBannerLink"
      :sound-src="stationARdata.soundSrc"
      class="start-ar-button"
    />

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
        @station-selected="updateStation"
      />
    </transition>

    <transition name="slide">
      <QRScanner
        v-if="showQRScanner"
        class="qr-scanner-container"
        :active="showQRScanner"
        :onboarded="onboarded"
        @close="toggleOverlay('qr-scanner')"
        @onboarded="setOnboarded"
      />
    </transition>
  </div>
  <Loading v-else />
</template>

<style scoped>
  .view-container {
    display: flex;
    flex-direction: column;
    gap: var(--components-gap);
    align-items: center;
    justify-content: flex-start;
  }

  .view-container h3 {
    max-width: 500px;
    text-align: center;
  }

  .ar-icon {
    margin-left: 10%;
  }

  .start-ar-button {
    width: 100%;
    max-width: var(--max-button-width);
    height: fit-content;
  }

  .icon-buttons-container {
    position: fixed;
    right: var(--gutter);
    bottom: var(--gutter);
    z-index: 3;
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

  .video-container {
    width: 100%;
    height: 56.25vw;
  }

  .video-container iframe {
    height: 56.25vw;
  }

  .stations-container {
    z-index: 98;
    width: calc(100vw - (var(--gutter) * 2));
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
</style>
