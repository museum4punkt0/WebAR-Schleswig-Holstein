<script setup>
  import { ref, toRefs, computed, toRaw, isProxy, onMounted } from 'vue'

  import Loading from '@/components/Loading.vue'
  import Button from '@/components/Button.vue'
  import MapViewer from '@/components/MapViewer.vue'

  import VLazyImage from 'v-lazy-image'

  const props = defineProps({
    stations: {
      type: Array,
      default: () => [],
    },
  })

  const stationsView = ref(true)
  const mapView = ref(false)
  const selectedStationMap = ref(null)
  const noContent = ref(false)

  const emit = defineEmits(['close', 'stationSelected'])

  const { stations } = toRefs(props)

  const production = import.meta.env.PROD

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  const isContentLoaded = computed(() => {
    return stations.value.length > 0
  })

  onMounted(() => {
    setTimeout(() => {
      if (!isContentLoaded.value) {
        noContent.value = true
      }
    }, 10000)
  })

  function handleClose() {
    emit('close')
  }

  function toggleView() {
    stationsView.value = !stationsView.value
    mapView.value = !mapView.value
  }

  function handleStationMapSelection(station) {
    selectedStationMap.value = station
    toggleView()
  }

  function handleStationSelection(stationSlug) {
    emit('stationSelected', stationSlug)
    emit('close')
  }

  function closeMapView() {
    selectedStationMap.value = null
    toggleView()
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

  function getFullImgSrc(imgUrl) {
    const fullImgUrl = `${
      production ? import.meta.env.VITE_ASSETS_BASE_URL : devAssetsBaseUrl.value
    }${imgUrl}`

    return fullImgUrl
  }
</script>

<template>
  <div v-if="isContentLoaded" class="stations-overview-container">
    <Button type="icon-close" class="close-button" @click="handleClose" />
    <transition name="slide-right">
      <div v-if="stationsView" class="stations-container">
        <h1>{{ $t('components.stationsOverview.title') }}</h1>
        <div class="station-cards-container">
          <div
            v-for="(station, index) in stations"
            :key="index"
            class="station-card"
          >
            <div class="station-card-image-info-container">
              <router-link
                :to="station.route"
                class="station-link"
                @click="handleStationSelection(station.slug)"
              ></router-link>
              <div class="station-card-data-container">
                <div class="station-card-image">
                  <v-lazy-image
                    :src="getDefaultImgSrc(station.imageFormats)"
                    :srcset="generateImgSrcset(station.imageFormats)"
                    :alt="station.imageAltText"
                  />
                </div>
                <div class="station-card-info">
                  <h3>{{ station.title }}</h3>
                  <div v-if="station.location" class="location-info">
                    <img
                      src="@/assets/icons/poi.svg"
                      :alt="$t('components.stationsOverview.poiIconAltText')"
                      class="poi-icon"
                    />
                    <p>{{ station.location }}</p>
                  </div>
                </div>
              </div>
            </div>
            <Button
              type="primary"
              :label="$t('components.stationsOverview.checkOnMapButtonLabel')"
              class="station-card-button"
              @click="handleStationMapSelection(station)"
            />
          </div>
        </div>
      </div>
    </transition>
    <transition name="slide-right">
      <MapViewer
        v-if="mapView && selectedStationMap"
        :station-name="selectedStationMap.title"
        :map-image-src="getFullImgSrc(selectedStationMap.mapImageSrc)"
        :map-image-alt-text="selectedStationMap.mapImageAltText"
        class="map-viewer"
        @close="closeMapView"
      />
    </transition>
  </div>
  <div v-else class="loading-container">
    <Button type="icon-close" class="close-button" @click="handleClose" />
    <Loading v-if="!isContentLoaded && !noContent" />
    <div v-else class="no-content-screen">
      <h4>{{ $t('components.stationsOverview.noContentTitle') }}</h4>
      <p>{{ $t('components.stationsOverview.noContentText') }}</p>
    </div>
  </div>
</template>

<style scoped>
  .stations-overview-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-width: var(--max-width);
    height: 100vh;
    padding: var(--gutter);
    overflow-y: auto;
    background-color: var(--bg-color);
  }

  .stations-container {
    display: flex;
    flex-direction: column;
    gap: calc(var(--gutter) * 2);
    align-items: center;
    justify-content: flex-start;
    width: 100%;
  }

  .close-button {
    flex-shrink: 0;
    margin-left: auto;
  }

  .view-container h1 {
    flex-shrink: 0;
    align-self: flex-start;
    margin-top: 56px;
  }

  .station-cards-container {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 10vh;
    width: 100%;
    margin-bottom: 7vh;
  }

  .station-card {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
  }

  .station-card:last-of-type {
    margin-bottom: 20%;
  }

  .station-card-data-container {
    grid-area: 1 / 1;
  }

  .station-card-image-info-container {
    display: grid;
    width: 100%;
    outline: 4px solid var(--tertiary-color);
    outline-offset: -4px;
  }

  .station-card-image {
    display: grid;
    width: 100%;
    height: 56.25vw;
    max-height: 400px;
    overflow: hidden;
  }

  .station-card-image img {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .station-card-image a {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  .station-card-info {
    padding: var(--gutter);
    background-color: var(--tertiary-color);
  }

  .station-card-info h3 {
    color: white;
    word-break: break-word;
  }

  .location-info {
    display: flex;
    flex-direction: row;
    gap: calc(var(--gutter) / 2);
    align-items: center;
  }

  .station-link {
    z-index: 100;
    display: block;
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
  }

  .location-info p {
    color: white;
  }

  .poi-icon {
    width: 1rem;
    height: 1rem;
  }

  .station-card-button {
    width: 50%;
    height: 60px;
    margin-top: var(--gutter);
  }

  .map-viewer {
    width: 100%;
    max-width: var(--max-width);
    height: 100%;
    margin: 0;
  }

  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: transform 0.5s ease-in-out;
  }

  .slide-left-enter-from,
  .slide-left-leave-to {
    transform: translateX(100vw);
  }

  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: transform 0.5s ease-in-out;
  }

  .slide-right-enter-from,
  .slide-right-leave-to {
    transform: translateX(-100vw);
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    max-width: var(--max-width);
    height: 100vh;
    padding: var(--gutter);
    overflow-y: auto;
    background-color: var(--bg-color);
  }

  .no-content-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .no-content-screen p,
  .no-content-screen h4 {
    text-align: center;
  }

  @media screen and (max-width: 640px) {
    .station-card-button {
      width: 100%;
    }

    .station-card-info h3 {
      font-size: 6vw;
    }
  }
</style>
