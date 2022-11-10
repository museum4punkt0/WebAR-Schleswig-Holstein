import { defineStore } from 'pinia'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL

if (!import.meta.env.PROD && !window.location.href.includes('localhost')) {
  axios.defaults.baseURL = import.meta.env.VITE_API_DEV_REMOTE_BASE_URL
}

const axiosConfig = {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_STRAPI_AUTH_TOKEN}`,
  },
}

function checkResponseData(response) {
  return response.status === 200 && response.data.data.length > 0
}

export const useMuseumStore = defineStore('museum', {
  state: () => ({
    currentMuseumData: undefined,
    relatedMuseumsData: undefined,
    allMuseumsData: undefined,
  }),

  actions: {
    setCurrentMuseumData(museumData) {
      this.currentMuseumData = museumData
    },

    setRelatedMuseumsData(data) {
      this.relatedMuseumsData = data
    },

    setAllMuseumsData(museumData) {
      this.allMuseumsData = museumData
    },

    async getMuseum(museumSlug, locale = 'all') {
      const response = await axios
        .get(
          `/museums?filters[slug][$eq]=${museumSlug}&locale=${locale}`,
          axiosConfig
        )
        .catch((error) => {
          console.error(error)
          this.router.push('/error')
        })

      if (checkResponseData(response)) {
        return response.data.data[0].attributes
      } else {
        this.router.push('/error')
      }
    },

    async getAllMuseums(locale = 'all') {
      const response = await axios
        .get(`/museums?locale=${locale}`, axiosConfig)
        .catch((error) => {
          console.error(error)
          this.router.push('/error')
        })

      if (checkResponseData(response)) {
        return response.data.data
      } else {
        this.router.push('/error')
      }
    },
  },
})
