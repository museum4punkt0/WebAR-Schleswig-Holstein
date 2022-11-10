<script setup>
  import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    isProxy,
    toRaw,
  } from 'vue'
  import Button from '@/components/Button.vue'
  import 'vue3-carousel/dist/carousel.css'
  import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
  import Panzoom from '@panzoom/panzoom'
  import { useI18n } from 'vue-i18n'
  import VLazyImage from 'v-lazy-image'

  const props = defineProps({
    imageArray: {
      type: Array,
      default() {
        return []
      },
    },
  })

  const carousel = ref(null)
  const showImageInfo = ref(false)
  const fullscreen = ref(false)
  const fullscreenImageSrc = ref(null)
  const fullscreenImageAltText = ref(null)
  const panzoom = ref(null)
  const panzoomWrapper = ref(null)
  const currentSlide = ref(0)

  const { t } = useI18n()

  const production = import.meta.env.PROD

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  onMounted(() => {
    panzoom.value = Panzoom(panzoomWrapper.value, {
      maxScale: 2,
      minScale: 1,
      contain: 'outside',
    })

    panzoom.value.pan(10, 10)
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

  function getFullImgSrc(imgSrc) {
    return `${
      production ? import.meta.env.VITE_ASSETS_BASE_URL : devAssetsBaseUrl.value
    }${imgSrc}`
  }

  function toggleImageInfo() {
    showImageInfo.value = !showImageInfo.value
  }

  function toggleFullscreenImage(image) {
    fullscreen.value = !fullscreen.value
    if (fullscreen.value) {
      fullscreenImageSrc.value = getFullImgSrc(image.attributes.url)
      fullscreenImageAltText.value = getImageAltText(image)
    } else {
      panzoom.value.reset()
      fullscreenImageSrc.value = null
      fullscreenImageAltText.value = null
    }
  }

  function getImageAltText(image) {
    if (image.attributes.alternativeText) {
      return image.attributes.alternativeText
    } else return t('components.imageCarousel.defaultImageAltText')
  }

  function getImageCaption(image) {
    if (image?.info_text) {
      return image.info_text
    } else return ''
  }

  function getImageCredits(image) {
    if (image?.credits) {
      return '© ' + image.credits
    } else return ''
  }

  function incrementSlide(amount) {
    currentSlide.value += amount
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
</script>

<template>
  <div
    class="fullscreen-image-container"
    :class="{ visible: fullscreenImageSrc }"
  >
    <Button
      type="icon-close"
      class="close-button"
      :options="['round', 'dropShadow']"
      @click="toggleFullscreenImage"
    />
    <div ref="panzoomWrapper" class="panzoom-wrapper">
      <img :src="fullscreenImageSrc" :alt="fullscreenImageAltText" />
    </div>
  </div>
  <div
    class="image-carousel-container"
    :class="{ 'full-width': imageArray.length > 1 }"
  >
    <div v-if="imageArray.length === 1" class="single-image-container">
      <v-lazy-image
        :src="getDefaultImgSrc(imageArray[0].image.data.attributes.formats)"
        :alt="getImageAltText(imageArray[0].image.data)"
        :srcset="generateImgSrcset(imageArray[0].image.data.attributes.formats)"
        class="carousel-image"
        @click="toggleFullscreenImage(imageArray[0].image.data)"
        @keypress="toggleFullscreenImage(imageArray[0].image.data)"
      />
      <div
        v-if="getImageCaption(imageArray[0]) || getImageCredits(imageArray[0])"
        class="image-info-container single"
        :class="{ visible: showImageInfo }"
      >
        <div class="toggle-info-icon-button">
          <span class="toggle-info-icon" :class="{ rotated: showImageInfo }">
          </span>
          <button class="toggle-info-button" @click="toggleImageInfo">
            {{ $t('components.imageCarousel.imageInfoTitle') }}
          </button>
        </div>
        <div class="toggle-info" :class="{ visible: showImageInfo }">
          <p v-if="getImageCaption(imageArray[0])" class="info-text">
            {{ getImageCaption(imageArray[0]) }}
          </p>
          <p v-if="getImageCredits(imageArray[0])" class="credits-text">
            {{ getImageCredits(imageArray[0]) }}
          </p>
          <hr />
        </div>
      </div>
    </div>
    <div v-else class="carousel-container">
      <Carousel ref="carousel">
        <Slide v-for="(galleryItem, index) in imageArray" :key="index">
          <div
            class="carousel-image-container"
            @click="toggleFullscreenImage(galleryItem.image.data)"
            @keypress="toggleFullscreenImage(galleryItem.image.data)"
          >
            <v-lazy-image
              :src="getDefaultImgSrc(galleryItem.image.data.attributes.formats)"
              :alt="getImageAltText(galleryItem.image.data)"
              :srcset="
                generateImgSrcset(galleryItem.image.data.attributes.formats)
              "
              class="carousel-image"
            />
          </div>
        </Slide>

        <template #addons="{ slidesCount }">
          <Navigation
            :class="{
              'is-first-slide': !currentSlide,
              'is-last-slide': currentSlide === slidesCount - 1,
            }"
          >
            <template #next>
              <span
                class="carousel-navigation-button next"
                @click="incrementSlide(1)"
                @keypress="incrementSlide(1)"
              >
              </span>
            </template>
            <template #prev>
              <span
                class="carousel-navigation-button prev"
                @click="incrementSlide(-1)"
                @keypress="incrementSlide(-1)"
              >
              </span>
            </template>
          </Navigation>
          <Pagination />
        </template>
      </Carousel>
      <div
        v-if="
          getImageCaption(imageArray[currentSlide]) ||
          getImageCredits(imageArray[currentSlide])
        "
        class="image-info-container gallery"
      >
        <div class="toggle-info-icon-button">
          <span class="toggle-info-icon" :class="{ rotated: showImageInfo }">
          </span>
          <button class="toggle-info-button" @click="toggleImageInfo">
            {{ $t('components.imageCarousel.imageInfoTitle') }}
          </button>
        </div>
        <div class="toggle-info" :class="{ visible: showImageInfo }">
          <p v-if="getImageCaption(imageArray[currentSlide])" class="info-text">
            {{ getImageCaption(imageArray[currentSlide]) }}
          </p>
          <p
            v-if="getImageCredits(imageArray[currentSlide])"
            class="credits-text"
          >
            {{ getImageCredits(imageArray[currentSlide]) }}
          </p>
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  :root {
    --slide-arrow-button-size: 30px;
    --pagination-icon-size: 7px;
    --pagination-active-icon-size: 11px;
    --pagination-active-icon-color: var(--primary-color);
    --pagination-icon-color: lightgray;
    --vc-clr-primary: transparent;
    --vc-nav-width: var(--slide-arrow-button-size);
    --vc-pgn-width: var(pagination-icon-size);
    --vc-pgn-height: var(pagination-icon-size);
    --vc-pgn-margin: var(pagination-icon-size);
  }

  .image-carousel-container {
    width: 100%;
    max-width: var(--max-width);
  }

  .image-carousel-container.full-width {
    width: 100vw;
    margin: 0 calc(var(--gutter) * -1);
  }

  .single-image-container {
    width: 100%;
    height: 100%;
  }

  .carousel-image-container {
    width: 100%;
    height: 50vh;
    min-height: 300px;
  }

  .carousel-image {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  .carousel-navigation-button {
    width: var(--slide-arrow-button-size);
    height: var(--slide-arrow-button-size);
    background-image: url('@/assets/icons/arrow-white.svg');
    background-size: cover;
  }

  .carousel-navigation-button.next {
    transform: rotate(180deg);
  }

  /* stylelint-disable selector-class-pattern */
  .carousel__prev {
    left: calc(var(--gutter) + (var(--slide-arrow-button-size) / 2));
  }

  .carousel__next {
    right: calc(var(--gutter) + (var(--slide-arrow-button-size) / 2));
  }

  .carousel__next,
  .carousel__prev {
    top: calc(50% - (var(--slide-arrow-button-size) / 2));
  }

  .carousel__next.is-last-slide,
  .carousel__prev.is-first-slide {
    display: none;
  }

  .carousel__pagination {
    align-items: center;
    height: calc(var(--pagination-active-icon-size) * 2);
    padding: 0;
  }

  .carousel__pagination-item {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .carousel__pagination-button {
    display: inline-block;
    width: calc(var(--pagination-icon-size));
    height: calc(var(--pagination-icon-size));
    padding: 0;
    margin: var(--pagination-icon-size);
    overflow: none;
    text-align: center;
    text-decoration: none;
    background-color: var(--pagination-icon-color);
    border-style: none;
    border-radius: 100%;
    outline: none;
  }

  .carousel__pagination-button--active {
    width: var(--pagination-active-icon-size);
    height: var(--pagination-active-icon-size);
    background-color: var(--pagination-active-icon-color);
  }
  /* stylelint-enable selector-class-pattern */

  .image-info-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: calc(100% - var(gutter) * 2);
  }

  .image-info-container.gallery {
    padding: 0 var(--gutter);
  }

  .image-info-container.single {
    max-height: 1.1rem;
    margin-top: var(--gutter);
    transition: all 0.3s ease-in-out;
  }

  .image-info-container.single.visible {
    max-height: 500px;
    margin-top: var(--gutter);
    transition: all 0.3s ease-in-out;
  }

  .toggle-info {
    position: relative;
    z-index: 1;
    width: 100%;
    overflow: hidden;
    font-size: 0;
    opacity: 0;

    /* stylelint-disable-next-line max-line-length */
    transition: font-size 0.25s ease 0.25s, opacity 0.3s ease,
      transform 0.25s ease 0.1s;
    transform: translateY(-100%);
  }

  .toggle-info.visible {
    font-size: calc(1rem * 0.8);
    opacity: 1;
    /* stylelint-disable-next-line max-line-length */
    transition: font-size 0.25s ease, opacity 0.25s ease 0.25s,
      transform 0.5s ease 0.1s;
    transform: translateY(0);
  }

  .toggle-info p {
    margin-top: 0.5rem;
    margin-bottom: 0;
    text-align: right;
  }

  .toggle-info-icon {
    display: inline-block;
    width: calc(1rem * 0.8);
    height: calc(1rem * 0.8);
    background-image: url('@/assets/icons/plus-icon.svg');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    transition: transform 0.2s;
    transform: rotate(0deg);
  }

  .toggle-info-icon.rotated {
    width: calc(1rem * 0.8);
    height: calc(1rem * 0.8);
    transform: rotate(45deg);
  }

  .toggle-info-icon-button {
    display: flex;
    gap: calc(1rem * 0.5);
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .toggle-info-button {
    position: relative;
    z-index: 2;
    padding: 0;
    font-size: 1.1rem;
    color: black;
    cursor: pointer;
    background-color: transparent;
    background-color: white;
    border: 0;
  }

  .credits-text {
    color: rgb(124 124 124);
  }

  .fullscreen-image-container {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100vw;
    height: 100vh;
    visibility: hidden;
    background-color: rgb(0 0 0 / 70%);
    opacity: 0;
    transition: visibility 0.5s, opacity 0.5s;
  }

  .fullscreen-image-container.visible {
    visibility: visible;
    opacity: 1;
  }

  .fullscreen-image-container img {
    width: 100%;
    max-width: 100%;
    object-fit: contain;
  }

  .panzoom-wrapper {
    position: absolute;
    right: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    margin-right: auto;
    margin-left: auto;
  }

  .close-button {
    position: absolute;
    top: var(--gutter);
    right: var(--gutter);
    z-index: 101;
  }
</style>
