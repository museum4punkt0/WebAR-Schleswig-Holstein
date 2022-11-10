<script setup>
  import { onMounted, computed, inject } from 'vue'
  import Loading from '@/components/Loading.vue'
  import Button from '@/components/Button.vue'
  import CookieBanner from '@/components/CookieBanner.vue'

  import { useSettingsStore } from '@/stores/settings'
  import { useMuseumStore } from '@/stores/museum'

  const settings = useSettingsStore()
  const museumStore = useMuseumStore()

  const cookies = inject('$cookies')

  const production = import.meta.env.PROD

  const isContentLoaded = computed(() => {
    return (
      museumStore.allMuseumsData &&
      Object.keys(museumStore.allMuseumsData).length > 0
    )
  })

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  const museums = computed(() => {
    return museumStore.allMuseumsData.map((museum) => {
      return {
        name: museum.attributes.name,
        slug: museum.attributes.slug,
        image: production
          ? import.meta.env.VITE_ASSETS_BASE_URL +
            museum.attributes.welcome_image.data.attributes.url
          : devAssetsBaseUrl.value +
            museum.attributes.welcome_image.data.attributes.url,
      }
    })
  })

  onMounted(() => {
    setupPage()

    settings.$subscribe((mutation, state) => {
      // If current museum language does not match the language setting,
      // update museum data:
      if (
        museumStore.currentMuseumData &&
        museumStore.currentMuseumData.locale !== settings.locale
      ) {
        setupPage()
      }
    })

    if (window.scrollY > 0) {
      window.scrollTo(0, 0)
    }

    if (cookies.get('cookies')) {
      settings.setCookiesAccepted(true)
    }
  })

  function setupPage() {
    museumStore.setCurrentMuseumData(undefined)
    museumStore.setRelatedMuseumsData(undefined)
    museumStore.setAllMuseumsData(undefined)

    fetchAllMuseumsData(settings.locale).then(() => {
      // If language setting in cookies don't match the current museum
      // language, change it.
      checkCookiesLanguage()
    })

    if (window.scrollY > 0) {
      window.scrollTo(0, 0)
    }
  }

  async function fetchAllMuseumsData(locale) {
    await museumStore.getAllMuseums(locale).then((response) => {
      // Set museums data in Store:
      museumStore.setAllMuseumsData(response)
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
</script>

<template>
  <div v-if="isContentLoaded" class="view-container">
    <CookieBanner v-if="settings.cookiesAccepted === undefined" />

    <div class="museum-cards-container">
      <div>
        <h3>{{ $t('pages.main.title') }}</h3>
        <p>{{ $t('pages.main.text') }}</p>
      </div>
      <div v-for="(museum, index) in museums" :key="index" class="museum-card">
        <div class="museum-card-image-title-container">
          <div class="museum-card-image-container">
            <img
              :src="museum.image"
              :alt="`${$t('pages.main.museumImageAltText')} ${museum.name}`"
            />
            <router-link
              :to="`/${museum.slug}`"
              class="museum-link"
            ></router-link>
          </div>
          <h4>{{ museum.name }}</h4>
        </div>
        <Button
          type="primary"
          :label="$t('pages.main.discoverButtonLabel')"
          :route="`/${museum.slug}`"
          class="museum-card-button"
        />
      </div>
    </div>
  </div>
  <Loading v-else />
</template>

<style scoped>
  .view-container {
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
    align-items: center;
    justify-content: flex-start;
  }

  /* ----------------------------- Museum cards ----------------------------- */

  .museum-cards-container {
    display: flex;
    flex-direction: column;
    gap: 5vh;
    max-width: 100%;
    margin-bottom: var(--components-gap);
  }

  .museum-cards-container h3,
  .museum-cards-container p {
    text-align: center;
  }

  .museum-card {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    height: fit-content;
  }

  .museum-card-image-title-container {
    border: 4px solid var(--tertiary-color);
  }

  .museum-card-image-container {
    display: grid;
    width: 100%;
    height: 56.25vw;
    max-height: 400px;
    overflow: hidden;
  }

  .museum-card img {
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .museum-card h4 {
    margin: var(--gutter);
  }

  .museum-card-button {
    align-self: flex-end;
    width: calc(40% - var(--gutter) / var(--font-scale-factor) * 2);
    margin-top: -4px;
  }

  .museum-link {
    z-index: 3;
    display: block;
    grid-area: 1 / 1;
    width: 100%;
    height: 100%;
  }

  @media screen and (max-width: 550px) {
    .museum-card-button {
      align-self: center;
      width: 100%;
    }
  }
</style>
