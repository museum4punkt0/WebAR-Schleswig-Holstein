<script setup>
  import {
    ref,
    computed,
    onMounted,
    onBeforeMount,
    onBeforeUnmount,
    shallowRef,
    inject,
  } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  import { useI18n } from 'vue-i18n'

  import Loading from '@/components/Loading.vue'
  import Button from '@/components/Button.vue'
  import Header from '@/components/Header.vue'
  import ARCallToAction from '@/components/ARCallToAction.vue'
  import Introduction from '@/components/Introduction.vue'
  import Paragraph from '@/components/Paragraph.vue'
  import ExtraInfo from '@/components/ExtraInfo.vue'
  import ImageCarousel from '@/components/ImageCarousel.vue'
  import AudioPlayer from '@/components/AudioPlayer.vue'
  import VideoPlayer from '@/components/VideoPlayer.vue'
  import Quiz from '@/components/Quiz.vue'
  import CookieBanner from '@/components/CookieBanner.vue'

  import StationsOverview from '@/components/StationsOverview.vue'
  import QRScanner from '@/components/QRScanner.vue'

  import YouTube from 'vue3-youtube'

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

  const dynamicComponents = ref([])

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
          settings.setLocale(museumStore.currentMuseumData?.locale)
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
        dynamicComponents.value = []
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

        const newRoute = '/' + museumSlug.value + '/' + stationSlug.value
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

  // ------------------------------- Header data -------------------------------

  const headerData = computed(() => {
    if (stationStore.currentStationData.header) {
      return {
        title: stationStore.currentStationData.header.title,
        text: stationStore.currentStationData.header.description,
        imgFormats:
          stationStore.currentStationData.image.data.attributes.formats,
        imgAlt: stationStore.currentStationData.image.data.attributes
          .alternativeText
          ? stationStore.currentStationData.image.data.attributes
              .alternativeText
          : t('components.header.imageDefaultAltText'),
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
      return stationStore.currentStationData.audio_description.data.attributes
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

  // ------------------------------ Introduction -------------------------------

  const introductionData = computed(() => {
    const introduction = getStationComponent('introduction')
    if (introduction) {
      return introduction
    } else return undefined
  })

  const introductionDataConsistent = computed(() => {
    const introduction = getStationComponent('introduction')
    if (introduction.title && introduction.text) {
      return true
    } else {
      console.error('Introduction component data is not consistent')
      return false
    }
  })

  // -------------------------------- Paragraph --------------------------------

  const paragraphData = computed(() => {
    const paragraph = getStationComponent('paragraph')
    if (paragraph) {
      return paragraph
    } else return undefined
  })

  const paragraphDataConsistent = computed(() => {
    const paragraph = getStationComponent('paragraph')
    if (paragraph.title && paragraph.text) {
      return true
    } else {
      console.error('Paragraph component data is not consistent')
      return false
    }
  })

  // ------------------------------- Extra info --------------------------------

  const extraInfoData = computed(() => {
    const extraInfo = getStationComponent('extra-info')
    if (extraInfo) {
      return extraInfo
    } else return undefined
  })

  const extraInfoDataConsistent = computed(() => {
    const component = getStationComponent('extra-info')
    if (component.short_description && component.text) {
      return true
    } else {
      console.error('Extra Info component data is not consistent')
      return false
    }
  })

  // --------------------- Single image & Image gallery ------------------------

  const singleImageData = computed(() => {
    const singleImage = getStationComponent('single-image')
    if (singleImage) return [singleImage]
    else return undefined
  })

  const singleImageDataConsistent = computed(() => {
    const component = getStationComponent('single-image')
    let dataConsistent = false
    if (component.image.data.attributes.formats) {
      dataConsistent = true
    }

    if (!dataConsistent)
      console.error('Single Image component data is not consistent')

    return dataConsistent
  })

  const imageGalleryData = computed(() => {
    const imageGallery = getStationComponent('image-gallery')
    if (imageGallery)
      return imageGallery.image_gallery.filter(
        (item) => item.image.data.attributes
      )
    else return undefined
  })

  const imageGalleryDataConsistent = computed(() => {
    const imageGallery = getStationComponent('image-gallery')
    let dataConsistent = false
    let counter = 0
    imageGallery.image_gallery.map((item) => {
      if (item.image.data.attributes.formats) {
        counter++
      }
      if (counter === imageGallery.image_gallery.length) {
        dataConsistent = true
      }
    })

    if (!dataConsistent)
      console.error('Image Gallery component data is not consistent')

    return dataConsistent
  })

  // -------------------------------- Video ------------------------------------

  const videoData = computed(() => {
    const video = getStationComponent('video')
    if (video) {
      return video
    } else return undefined
  })

  const videoDataConsistent = computed(() => {
    const component = getStationComponent('video')
    if (component.video_url) {
      return true
    } else {
      console.error('Video Player component data is not consistent')
      return false
    }
  })

  // -------------------------------- Audio ------------------------------------

  const audioData = computed(() => {
    const audio = getStationComponent('audio-player')
    if (audio) {
      return audio
    } else return undefined
  })

  const audioDataConsistent = computed(() => {
    const component = getStationComponent('audio-player')
    if (
      component.audio.data.attributes &&
      component.title &&
      component.credits
    ) {
      return true
    } else {
      console.error('Audio Player component data is not consistent')
      return false
    }
  })

  // -------------------------------- Quiz ------------------------------------

  const quizData = computed(() => {
    const quiz = getStationComponent('quiz')
    if (quiz) {
      return quiz
    } else return undefined
  })

  const quizDataConsistent = computed(() => {
    const component = getStationComponent('quiz')
    if (
      component.question &&
      component.quiz_answer.length > 0 &&
      component.title &&
      component.text &&
      component.image.data.attributes.formats
    ) {
      return true
    } else {
      console.error('Quiz component data is not consistent')
      return false
    }
  })

  // --------------------------- AR Call-to-action -----------------------------

  const arCTAData = computed(() => {
    if (
      stationStore.currentStationData.ar_experience &&
      stationStore.currentStationData.ar_experience.usdz_file.data.attributes
        .url &&
      stationStore.currentStationData.ar_experience.glb_gltf_file.data
        .attributes.url
    ) {
      const arObject = {
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
      }

      if (
        stationStore.currentStationData.ar_experience.sound?.data?.attributes
          ?.url
      ) {
        arObject.soundSrc = production
          ? import.meta.env.VITE_ASSETS_BASE_URL +
            stationStore.currentStationData.ar_experience.sound?.data
              ?.attributes?.url
          : devAssetsBaseUrl.value +
            stationStore.currentStationData.ar_experience.sound?.data
              ?.attributes?.url
      }
      return arObject
    } else return undefined
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
    dynamicComponents.value = []
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
        response?.header?.title &&
        response?.header?.description &&
        response?.image &&
        response?.station_content?.length > 0 &&
        response?.ar_experience?.text &&
        response?.ar_experience?.glb_gltf_file?.data?.attributes?.url &&
        response?.ar_experience?.usdz_file?.data?.attributes?.url
      ) {
        stationStore.setCurrentStationData(response)
        setComponentsOrder()
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
      const localeSetting = cookies.get('locale').split('"')[1]
      if (
        settings.locale !== localeSetting ||
        stationStore.currentStationData.locale !== localeSetting
      ) {
        settings.setLocale(localeSetting)
      }
    }
  }

  function getStationComponent(componentName) {
    const componentQuery = (component) =>
      component.__component === `station-components.${componentName}`
    if (
      stationStore.currentStationData.station_content &&
      stationStore.currentStationData.station_content.some(componentQuery)
    ) {
      return stationStore.currentStationData.station_content.find(
        componentQuery
      )
    } else return undefined
  }

  // This populates an array with the dynamic components that should
  // be displayed sin the order established in the CMS:
  function setComponentsOrder() {
    if (stationStore.currentStationData.station_content) {
      stationStore.currentStationData.station_content.map((component) => {
        if (
          component.__component === 'station-components.introduction' &&
          introductionDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(Introduction),
            props: {
              title: introductionData.value.title,
              text: introductionData.value.text,
            },
            id: dynamicComponents.value.length,
          })
        }
        if (
          component.__component === 'station-components.paragraph' &&
          paragraphDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(Paragraph),
            props: {
              title: paragraphData.value.title,
              text: paragraphData.value.text,
            },
            id: dynamicComponents.value.length,
          })
        }
        if (
          component.__component === 'station-components.extra-info' &&
          extraInfoDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(ExtraInfo),
            props: {
              mainText: extraInfoData.value.short_description,
              subText: extraInfoData.value.text,
            },
            id: dynamicComponents.value.length,
          })
        }
        if (
          component.__component === 'station-components.single-image' &&
          singleImageDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(ImageCarousel),
            props: {
              imageArray: singleImageData.value,
            },
            id: dynamicComponents.value.length,
          })
        }
        if (
          component.__component === 'station-components.image-gallery' &&
          imageGalleryDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(ImageCarousel),
            props: {
              imageArray: imageGalleryData.value,
            },
            id: dynamicComponents.value.length,
          })
        }
        if (
          component.__component === 'station-components.video' &&
          videoDataConsistent.value &&
          settings.cookiesAccepted
        ) {
          dynamicComponents.value.push({
            name: shallowRef(YouTube),
            props: {
              src: videoData.value.video_url,
              width: '100%',
              height: '100%',
            },
            id: dynamicComponents.value.length,
            class: 'video-container',
          })
        }
        if (
          component.__component === 'station-components.audio-player' &&
          audioDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(AudioPlayer),
            props: {
              src: audioData.value.audio.data.attributes.url,
              fileMime: audioData.value.audio.data.attributes.fileMime,
              posterImg: audioData.value.image.data.attributes
                ? audioData.value.image.data.attributes
                : null,
              title: audioData.value.title,
              text: audioData.value.credits,
            },
            id: dynamicComponents.value.length,
          })
        }
        if (
          component.__component === 'station-components.quiz' &&
          quizDataConsistent.value
        ) {
          dynamicComponents.value.push({
            name: shallowRef(Quiz),
            props: {
              question: quizData.value.question,
              answers: quizData.value.quiz_answer,
              image: quizData.value.image.data.attributes
                ? quizData.value.image.data.attributes
                : null,
              title: quizData.value.title,
              text: quizData.value.text,
            },
            id: dynamicComponents.value.length,
          })
        }
      })
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

    <Header
      v-if="headerData"
      :title="headerData.title"
      :text="headerData.text"
      :img-formats="headerData.imgFormats"
      :img-alt="headerData.imgAlt"
    />

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

    <!-- This renders components dynamically based on the order
    set in the CMS:  -->
    <component
      :is="component.name"
      v-for="component in dynamicComponents"
      v-bind="component.props"
      :key="component.id"
      :class="component.class"
    ></component>

    <ARCallToAction
      v-if="arCTAData"
      :text="arCTAData.text"
      :gltf-model-src="arCTAData.gltfModelSrc"
      :usdz-model-src="arCTAData.usdzModelSrc"
      :sound-src="arCTAData.soundSrc"
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
    padding-top: 0;
    padding-bottom: 0;
  }

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

  .video-container {
    width: 100%;
    height: 56.25vw;
    padding: var(--gutter) 0;
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
