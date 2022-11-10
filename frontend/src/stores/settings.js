import { defineStore } from 'pinia'
import i18n from '@/i18n/i18n'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    open: false,
    locale: 'de',
    dgs: false,
    audioDescription: false,
    contrast: false,
    largerText: false,
    cookiesAccepted: undefined,
  }),

  actions: {
    toggleMenu() {
      this.open = !this.open
    },

    setLocale(locale) {
      if (locale !== this.locale) {
        this.locale = locale
        i18n.global.locale = locale

        if (document.getElementById(`${locale}-lang-radio`)) {
          document.getElementById(`${locale}-lang-radio`).checked = true
          document
            .getElementById(`${locale}-lang-radio`)
            .classList.add('checked')
        }
      }
    },

    setContrast(contrast) {
      this.contrast = contrast
      if (contrast) {
        document.documentElement.style.setProperty(
          '--primary-color',
          'rgb(0 0 0)'
        )
        document.documentElement.style.setProperty(
          '--light-color',
          'rgb(0 0 0)'
        )
      } else {
        document.documentElement.style.setProperty(
          '--primary-color',
          'rgb(204 162 56)'
        )
        document.documentElement.style.setProperty(
          '--light-color',
          'rgb(220 220 220)'
        )
      }
    },

    setDgs(dgs) {
      this.dgs = dgs
      if (dgs === true) {
        i18n.global.locale = 'de'
        this.locale = 'de'

        if (document.getElementById('dgs-lang-radio')) {
          document.getElementById('dgs-lang-radio').checked = true
        }
      }
    },

    setAudioDescription(audioDescription) {
      this.audioDescription = audioDescription
    },

    setLargerText(largerText) {
      this.largerText = largerText
      if (largerText) {
        document.documentElement.style.setProperty('--font-scale-factor', 2)
        document.documentElement.style.setProperty('--h1-scale-factor', 0.5)
        document.documentElement.style.setProperty('--h2-scale-factor', 0.6)
        document.documentElement.style.setProperty('--h3-scale-factor', 0.7)
        document.documentElement.style.setProperty('--h4-scale-factor', 0.8)
        document.documentElement.style.setProperty(
          '--menu-label-scale-factor',
          0.6
        )
        document.documentElement.style.setProperty(
          '--button-label-scale-factor',
          1
        )
        document.documentElement.style.setProperty(
          '--timeline-font-scale-factor',
          0.7
        )
      } else {
        document.documentElement.style.setProperty('--font-scale-factor', 1)
        document.documentElement.style.setProperty('--h1-scale-factor', 1)
        document.documentElement.style.setProperty('--h2-scale-factor', 1)
        document.documentElement.style.setProperty('--h3-scale-factor', 1)
        document.documentElement.style.setProperty('--h4-scale-factor', 1)
        document.documentElement.style.setProperty(
          '--menu-label-scale-factor',
          1
        )
        document.documentElement.style.setProperty(
          '--button-label-scale-factor',
          1.2
        )
        document.documentElement.style.setProperty(
          '--timeline-font-scale-factor',
          0.9
        )
      }
    },

    setCookiesAccepted(cookiesAccepted) {
      this.cookiesAccepted = cookiesAccepted
    },
  },
})
