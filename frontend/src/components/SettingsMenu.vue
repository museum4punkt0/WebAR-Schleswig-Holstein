<script setup>
  import { ref, computed, onMounted, onBeforeMount, inject, toRaw } from 'vue'
  import i18n from '@/i18n/i18n'
  import { useI18n } from 'vue-i18n'
  import { useSettingsStore } from '@/stores/settings'
  import { useMuseumStore } from '@/stores/museum'

  const museumStore = useMuseumStore()

  const settings = useSettingsStore()

  // Used later to reset page Y scroll position:
  const scrollPosition = ref(0)

  const languageOptions = ref([])

  // Used for internal state handling:
  const currLangOption = ref(null)

  const cookies = inject('$cookies')

  const settingsLabel = computed(() => {
    return settings.open
      ? 'components.settingsMenu.mainLabel.open'
      : 'components.settingsMenu.mainLabel.closed'
  })

  const production = import.meta.env.PROD

  const { t } = useI18n()

  const devAssetsBaseUrl = computed(() => {
    if (window.location.href.includes('localhost')) {
      return import.meta.env.VITE_DEV_LOCAL_ASSETS_BASE_URL
    } else return import.meta.env.VITE_DEV_REMOTE_ASSETS_BASE_URL
  })

  const logoSrc = computed(() => {
    return museumStore.currentMuseumData?.logo?.data?.attributes?.url
      ? production
        ? import.meta.env.VITE_ASSETS_BASE_URL +
          museumStore.currentMuseumData.logo.data.attributes.url
        : devAssetsBaseUrl.value +
          museumStore.currentMuseumData.logo.data.attributes.url
      : new URL(`../assets/images/logos/lmsh_logo.svg`, import.meta.url).href
  })

  const museumSlug = computed(() => {
    return museumStore.currentMuseumData?.slug
      ? museumStore.currentMuseumData.slug
      : ''
  })

  const showIcons = computed(() => {
    return settings.largerText === false && window.innerWidth > 400
  })

  const logoAltText = computed(() => {
    if (
      museumStore.currentMuseumData?.logo?.data?.attributes?.alternativeText
    ) {
      return museumStore.currentMuseumData.logo.data.attributes.alternativeText
    } else return t('components.settingsMenu.museumLogoDefaultAltText')
  })

  onBeforeMount(() => {
    const options = Object.keys(i18n.global.messages).map((lang) => {
      const langName = () => {
        if (lang === 'de') {
          return 'Deutsch'
        } else if (lang === 'en') {
          return 'English'
        } else if (lang === 'da') {
          return 'Dansk'
        }
      }
      return {
        name: langName(),
        value: lang,
        id: `${lang}-lang-radio`,
      }
    })

    options.push({
      name: 'Deutsche Gebärdensprache',
      value: 'dgs',
      id: 'dgs-lang-radio',
      icon: new URL(`../assets/icons/sign-language.svg`, import.meta.url).href,
      iconAltText: 'Deutsche Gebärdensprache',
    })

    languageOptions.value = options
  })

  onMounted(() => {
    if (cookies.isKey('dgs')) {
      const dgsSetting = JSON.parse(cookies.get('dgs'))
      if (dgsSetting === true) {
        settings.setDgs(true)
      }
    }

    if (cookies.isKey('contrast')) {
      const contrastSetting = JSON.parse(cookies.get('contrast'))
      settings.setContrast(contrastSetting)
      document.getElementById('contrast-checkbox').checked = contrastSetting
    }

    if (cookies.isKey('audioDescription')) {
      const audioDescriptionSetting = JSON.parse(
        cookies.get('audioDescription')
      )
      settings.setAudioDescription(audioDescriptionSetting)
      document.getElementById('audio-description-checkbox').checked =
        audioDescriptionSetting
    }

    if (cookies.isKey('largerText')) {
      const largerTextSetting = JSON.parse(cookies.get('largerText'))
      settings.setLargerText(largerTextSetting)
      document.getElementById('larger-text-checkbox').checked =
        largerTextSetting
    }

    currLangOption.value = settings.locale
    if (settings.dgs) {
      currLangOption.value = 'dgs'
    }
  })

  function handleLocaleChange(lang) {
    currLangOption.value = lang
    if (lang === 'dgs') {
      settings.setDgs(true)
      if (settings.cookiesAccepted) {
        cookies.set('dgs', JSON.stringify(settings.dgs))
        cookies.set('locale', JSON.stringify('de'))
      }
    } else {
      settings.setLocale(lang)
      if (settings.dgs) settings.setDgs(false)
      if (settings.cookiesAccepted) {
        cookies.set('locale', JSON.stringify(settings.locale))
        cookies.set('dgs', JSON.stringify(settings.dgs))
      }
    }
  }

  function handleContrastChange() {
    settings.setContrast(!settings.contrast)
    if (settings.cookiesAccepted) {
      cookies.set('contrast', JSON.stringify(settings.contrast))
    }
  }

  function handleTextSizeChange() {
    settings.setLargerText(!settings.largerText)
    if (settings.cookiesAccepted) {
      cookies.set('largerText', JSON.stringify(settings.largerText))
    }
  }

  function handleAudioDescriptionChange() {
    settings.setAudioDescription(!settings.audioDescription)
    if (settings.cookiesAccepted) {
      cookies.set('audioDescription', JSON.stringify(settings.audioDescription))
    }
  }

  function handleMenuToggle() {
    settings.toggleMenu()

    const body = document.querySelector('body')

    // Prevent body vertical scrolling when menu is open:
    if (settings.open) {
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

  function isLanguageSelected(lang) {
    if (lang === 'dgs') {
      return settings.dgs
    } else {
      if (settings.dgs) return false
      return settings.locale === lang
    }
  }
</script>

<template>
  <div class="settings-menu-container" :class="{ open: settings.open }">
    <div class="settings-menu-upper-bar">
      <router-link :to="`/${museumSlug}`" class="logo">
        <img v-if="logoSrc" :src="logoSrc" :alt="logoAltText" />
      </router-link>

      <button class="settings-menu-toggle-button" @click="handleMenuToggle">
        <p>{{ $t(settingsLabel) }}</p>
        <img
          v-if="settings.open"
          src="@/assets/icons/close-icon-menu.svg"
          :alt="$t('components.settingsMenu.closeIconAltText')"
        />
        <img
          v-else
          src="@/assets/icons/settings-icon.svg"
          :alt="$t('components.settingsMenu.settingsIconAltText')"
        />
      </button>
    </div>
    <div class="settings-menu-content" :class="{ open: settings.open }">
      <div v-if="languageOptions" class="language-menu">
        <h3>{{ $t('components.settingsMenu.languageMenuTitle') }}</h3>
        <div
          v-for="(option, index) in languageOptions"
          :key="index"
          class="language-option"
        >
          <label
            :for="option.id"
            :class="{ checked: isLanguageSelected(option.value) }"
          >
            <input
              :id="option.id"
              type="radio"
              name="language"
              :value="option.value"
              :checked="isLanguageSelected(option.value)"
              @change="handleLocaleChange(option.value)"
            />
            <span class="custom-radio"></span>
            {{ option.name }}
          </label>
          <img
            v-if="option.icon && showIcons"
            :src="option.icon"
            :alt="option.iconAltText"
            class="option-icon"
          />
        </div>
      </div>
      <div class="accessibility-menu">
        <h3>{{ $t('components.settingsMenu.accessibilityMenu.title') }}</h3>
        <div class="accessibility-option">
          <img
            v-if="showIcons"
            src="@/assets/icons/audio-description.svg"
            :alt="$t('components.settingsMenu.audioDescriptionIconAltText')"
            class="option-icon"
          />
          <label for="audio-description-checkbox" class="checkbox-label">
            <input
              id="audio-description-checkbox"
              type="checkbox"
              value="audio-description"
              @change="handleAudioDescriptionChange"
            />
            {{
              $t(
                'components.settingsMenu.accessibilityMenu.audioDescriptionLabel'
              )
            }}
            <div class="switch"><div class="knob"></div></div>
          </label>
        </div>
        <div class="accessibility-option">
          <img
            v-if="showIcons"
            src="@/assets/icons/contrast.svg"
            :alt="$t('components.settingsMenu.contrastIconAltText')"
            class="option-icon"
          />
          <label for="contrast-checkbox" class="checkbox-label">
            <input
              id="contrast-checkbox"
              type="checkbox"
              value="contrast"
              @change="handleContrastChange"
            />
            {{ $t('components.settingsMenu.accessibilityMenu.contrastLabel') }}
            <div class="switch"><div class="knob"></div></div>
          </label>
        </div>
        <div class="accessibility-option">
          <img
            v-if="showIcons"
            src="@/assets/icons/larger-text.svg"
            :alt="$t('components.settingsMenu.largerTextIconAltText')"
            class="option-icon"
          />
          <label for="larger-text-checkbox" class="checkbox-label">
            <input
              id="larger-text-checkbox"
              type="checkbox"
              value="larger-text"
              @change="handleTextSizeChange"
            />
            {{
              $t('components.settingsMenu.accessibilityMenu.largerTextLabel')
            }}
            <div class="switch"><div class="knob"></div></div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  /* ---------------------------- Variables --------------------------------- */
  * {
    --menu-items-color: rgb(0 0 0);
    --settings-icon-size: 1rem;
    --radio-button-size: 22px;
    --switch-knob-size: 18px;
  }

  /* -------------------------- Main Container ------------------------------ */

  .settings-menu-container {
    position: fixed;
    top: 0;
    z-index: 98;
    display: flex;
    flex-direction: column;
    gap: calc(var(--gutter) * 2);
    align-items: flex-start;
    width: calc(100vw - (var(--gutter) * 2));
    min-width: calc(var(--min-width) - (var(--gutter) * 2));
    max-width: calc(var(--max-width) - (var(--gutter) * 2));
    height: calc(var(--settings-bar-height) - var(--gutter) * 2);
    padding: var(--gutter);
    margin: 0;
    overflow: hidden;
    background-color: white;
    transition: height 0.25s ease-in-out;
  }

  .settings-menu-container.open {
    height: calc(100% - (var(--gutter) * 2));
  }

  .settings-menu-upper-bar {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    width: 100%;
    height: calc(var(--settings-bar-height) - var(--gutter) * 2);
    margin: 0;
  }

  .logo {
    display: block;
    height: var(--logo-height);
  }

  .logo img {
    object-fit: contain;
    height: 100%;
    max-height: var(--logo-height);
  }

  /* ------------------------ Menu Toggle Button ---------------------------- */

  .settings-menu-toggle-button {
    z-index: 99;
    display: flex;
    gap: calc(var(--gutter) / 2);
    align-items: center;
    height: calc(1rem * var(--menu-label-scale-factor));
    padding: 0;
    margin-left: auto;
    background-color: transparent;
    border: 0;
    outline: none;
  }

  .settings-menu-toggle-button p {
    margin: 0;
    font-family: 'OpenSans SemiBold', sans-serif;
    font-size: calc(1rem * var(--menu-label-scale-factor));
    color: black;
  }

  .settings-menu-toggle-button img {
    width: calc(1rem * var(--menu-label-scale-factor));
  }

  /* --------------------------- Menu Content ------------------------------- */

  .settings-menu-content {
    display: flex;
    flex-direction: column;
    gap: 60px;
    align-items: flex-start;
    width: 100%;
    overflow-y: scroll;
    opacity: 0;
    transition: opacity 0.25s ease-in-out;
  }

  .settings-menu-content.open {
    opacity: 1;
  }

  .settings-menu-content h3 {
    margin-bottom: var(--gutter);
    font-family: 'OpenSans ExtraBold', sans-serif;
    font-size: calc(2rem * 0.6);
  }

  .language-menu,
  .accessibility-menu {
    width: 100%;
  }

  .language-option,
  .accessibility-option {
    position: relative;
    display: flex;
    flex-flow: row;
    align-items: center;
    padding: 10px 0;
    font-family: 'OpenSans Regular', sans-serif;
    font-size: 1rem;
    border-top: 1px solid var(--light-color);
  }

  .language-option:last-child {
    border-bottom: 1px solid var(--light-color);
  }

  .language-option label {
    margin-left: calc(var(--radio-button-size) + (var(--gutter) / 2));
  }

  .language-option input {
    position: absolute;
    width: 0;
    height: 0;
    cursor: pointer;
    opacity: 0;
  }

  .language-option img {
    margin-left: auto;
  }

  .option-icon {
    width: 1rem;
    height: 1rem;
  }

  .custom-radio {
    position: absolute;
    top: 50%;
    left: 0;
    box-sizing: border-box;
    width: var(--radio-button-size);
    height: var(--radio-button-size);
    background-color: white;
    border: 2px solid var(--light-color);
    border-radius: 50%;
    transform: translateY(-50%);
  }

  .custom-radio::after {
    position: absolute;
    display: none;
    content: '';
  }

  .language-option .custom-radio::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background-color: var(--primary-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .language-option input:checked ~ .custom-radio {
    box-sizing: border-box;
    background-color: white;
    border: 2px solid var(--primary-color);
  }

  .language-option input:checked ~ .custom-radio::after {
    display: block;
  }

  .language-option label.checked {
    font-family: 'OpenSans Bold', sans-serif;
  }

  .accessibility-option {
    gap: calc(var(--gutter) / 2);
  }

  .accessibility-option input {
    display: none;
  }

  .switch {
    flex-shrink: 0;
    width: 46px;
    height: 26px;
    margin-left: auto;
    vertical-align: text-bottom;
    background-color: var(--light-color);
    border-radius: 20px;
    transition: all 0.3s;
  }

  .knob {
    width: var(--switch-knob-size);
    height: var(--switch-knob-size);
    content: '';
    background-color: white;
    border-radius: 11px;
    transition: all 0.2s ease-in-out;
    transform: translate3d(4px, 4px, 0);
  }

  .accessibility-option input:checked + .switch {
    background-color: var(--primary-color);
  }

  .accessibility-option input:checked + .switch .knob {
    transform: translate3d(22px, 4px, 0);
  }

  .checkbox-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
  }

  /* -------------------------- Media Queries ------------------------------- */

  @media screen and (min-width: 768px) {
    .menu-list a {
      font-size: 3rem;
    }
  }

  @media screen and (max-width: 350px) {
    .switch {
      margin-left: 0;
    }

    .checkbox-label {
      flex-flow: row wrap;
      gap: var(--gutter);
      justify-content: flex-start;
    }
  }
</style>
