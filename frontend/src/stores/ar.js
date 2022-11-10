import { defineStore } from 'pinia'

export const useARStore = defineStore('AR', {
  state: () => ({
    os: 'other',
  }),

  actions: {
    checkMobileOS() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      if (/android/i.test(userAgent)) {
        this.os = 'Android'
      }
      const a = document.createElement('a')
      if (a.relList.supports('ar')) {
        this.os = 'iOS'
      }
    },
  },
})
