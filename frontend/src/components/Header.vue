<script setup>
  import { computed, isProxy, toRaw } from 'vue'
  import VLazyImage from 'v-lazy-image'

  defineProps({
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    imgFormats: {
      type: Object,
      default: () => {},
    },
    imgAlt: {
      type: String,
      default: '',
    },
  })

  const production = import.meta.env.PROD

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

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
  <header class="header-container">
    <div class="header-text">
      <h1>{{ title }}</h1>
      <p>{{ text }}</p>
    </div>
    <v-lazy-image
      :src="getDefaultImgSrc(imgFormats)"
      :alt="imgAlt"
      :srcset="generateImgSrcset(imgFormats)"
    />
  </header>
</template>

<style scoped>
  .header-container {
    width: 100%;
    color: white;
  }

  .header-container img {
    width: calc(100% + var(--gutter) * 2);
    height: 100%;
    object-fit: cover;
    margin-right: calc(-1 * var(--gutter));
    margin-left: calc(-1 * var(--gutter));
  }

  .header-text {
    width: 100%;
    padding: calc(var(--gutter) * 3.5) var(--gutter);
    margin-left: calc(-1 * var(--gutter));
    background-color: var(--primary-color);
  }

  .header-text h1 {
    margin-bottom: var(--gutter);
    word-wrap: break-word;
  }

  .header-text p {
    margin: 0;
    font-size: 1.4rem;
  }

  @media screen and (max-width: 480px) {
    .header-text h1 {
      font-size: max(10vw, 1.5rem);
    }
  }
</style>
