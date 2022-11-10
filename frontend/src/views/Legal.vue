<script setup>
  import {
    ref,
    reactive,
    computed,
    onBeforeMount,
    onMounted,
    inject,
  } from 'vue'

  import axios from 'axios'

  import { useI18n } from 'vue-i18n'

  import { useRouter, useRoute } from 'vue-router'

  import Loading from '@/components/Loading.vue'
  import Markdown from 'vue3-markdown-it'

  import { useSettingsStore } from '@/stores/settings'

  const settings = useSettingsStore()

  const router = useRouter()
  const route = useRoute()

  const cookies = inject('$cookies')

  const lang = ref(null)
  const apiRoute = ref(null)

  const scrollPosition = ref(0)

  const { t } = useI18n()

  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_STRAPI_AUTH_TOKEN}`,
    },
  }

  const contentData = reactive({})

  onBeforeMount(async () => {
    setApiRouteAndLanguage()

    if (lang.value !== settings.locale) {
      settings.setLocale(lang.value)
    }

    checkCookiesLanguage()

    await loadContent(apiRoute.value, settings.locale)
  })

  onMounted(() => {
    settings.$subscribe(async (mutation, state) => {
      if (
        contentData?.value?.locale &&
        contentData?.value?.locale !== settings.locale
      ) {
        contentData.value = {}
        setApiRouteAndLanguage()
        await loadContent(apiRoute.value, settings.locale)
      }
    })

    if (cookies.get('cookies') && settings.cookiesAccepted === undefined) {
      settings.setCookiesAccepted(true)
    }

    if (window.scrollY > 0) {
      window.scrollTo(0, 0)
    }
  })

  const isContentLoaded = computed(() => {
    return contentData.value && Object.keys(contentData.value).length > 0
  })

  const text = computed(() => {
    return contentData.value.text
  })

  // ----------------------------- Functions -----------------------------------

  async function loadContent(apiRoute, locale) {
    const response = await axios
      .get(`/${apiRoute}?locale=${locale}`, axiosConfig)
      .catch((error) => {
        console.error(error)
        router.push('/error')
      })

    if (checkResponseData(response)) {
      contentData.value = response.data.data.attributes

      // If the content language does not match the URL slug, replace the current
      // URL with the correct one:
      const currRoute = route.path.split('/')[1]
      if (apiRoute === 'privacy-policy') {
        if (settings.locale === 'en' && currRoute !== 'privacy') {
          window.history.replaceState({}, null, '/privacy')
        }
        if (settings.locale === 'de' && currRoute !== 'datenschutz') {
          window.history.replaceState({}, null, '/datenschutz')
        }
        if (settings.locale === 'da' && currRoute !== 'data-beskyttelse') {
          window.history.replaceState({}, null, '/data-beskyttelse')
        }
      }
      if (apiRoute === 'legal-notice') {
        if (settings.locale === 'en' && currRoute !== 'legal') {
          window.history.replaceState({}, null, '/legal')
        }
        if (settings.locale === 'de' && currRoute !== 'impressum') {
          window.history.replaceState({}, null, '/impressum')
        }
        if (settings.locale === 'da' && currRoute !== 'aftryk') {
          window.history.replaceState({}, null, '/aftryk')
        }
      }
      if (apiRoute === 'accessibility') {
        if (settings.locale === 'en' && currRoute !== 'accessibility') {
          window.history.replaceState({}, null, '/accessibility')
        }
        if (settings.locale === 'de' && currRoute !== 'barrierefreiheit') {
          window.history.replaceState({}, null, '/barrierefreiheit')
        }
        if (settings.locale === 'da' && currRoute !== 'tilgaengelighed') {
          window.history.replaceState({}, null, '/tilgaengelighed')
        }
      }
      if (apiRoute === 'cookies-usage') {
        if (settings.locale === 'en' && currRoute !== 'cookies-usage') {
          window.history.replaceState({}, null, '/cookies-usage')
        }
        if (settings.locale === 'de' && currRoute !== 'cookies-erklaerung') {
          window.history.replaceState({}, null, '/cookies-erklaerung')
        }
        if (settings.locale === 'da' && currRoute !== 'cookies-erklaering') {
          window.history.replaceState({}, null, '/cookies-erklaering')
        }
      }
    } else {
      console.error('Error loading data from CMS')
      router.push('/error')
    }
  }

  function setApiRouteAndLanguage() {
    const currRoute = route.path.split('/')[1]
    switch (currRoute) {
      case 'privacy':
        lang.value = 'en'
        apiRoute.value = 'privacy-policy'
        break
      case 'datenschutz':
        lang.value = 'de'
        apiRoute.value = 'privacy-policy'
        break
      case 'data-beskyttelse':
        lang.value = 'da'
        apiRoute.value = 'privacy-policy'
        break
      case 'legal':
        lang.value = 'en'
        apiRoute.value = 'legal-notice'
        break
      case 'impressum':
        lang.value = 'de'
        apiRoute.value = 'legal-notice'
        break
      case 'aftryk':
        lang.value = 'da'
        apiRoute.value = 'legal-notice'
        break
      case 'accessibility':
        lang.value = 'en'
        apiRoute.value = 'accessibility'
        break
      case 'barrierefreiheit':
        lang.value = 'de'
        apiRoute.value = 'accessibility'
        break
      case 'tilgaengelighed':
        lang.value = 'da'
        apiRoute.value = 'accessibility'
        break
      case 'cookies-usage':
        lang.value = 'en'
        apiRoute.value = 'cookies-usage'
        break
      case 'cookies-erklaerung':
        lang.value = 'de'
        apiRoute.value = 'cookies-usage'
        break
      case 'cookies-erklaering':
        lang.value = 'da'
        apiRoute.value = 'cookies-usage'
        break
    }
  }

  function toggleOverlay(overlay) {
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

  function checkResponseData(response) {
    return response.status === 200 && response.data.data
  }

  function checkCookiesLanguage() {
    if (cookies.isKey('locale')) {
      const localeSetting = JSON.parse(cookies.get('locale'))
      if (settings.locale !== localeSetting) {
        settings.setLocale(localeSetting)
      }
    }
  }
</script>

<template>
  <div v-if="isContentLoaded" class="view-container">
    <Markdown :source="text" />
  </div>
  <Loading v-else />
</template>

<style scoped>
  .view-container {
    display: flex;
    flex-direction: column;
    gap: var(--components-gap);
    align-items: flex-start;
    justify-content: flex-start;
    color: black;
  }

  .view-container p {
    white-space: pre-wrap;
  }
</style>
