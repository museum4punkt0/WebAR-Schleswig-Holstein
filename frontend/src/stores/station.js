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

export const useStationStore = defineStore('station', {
  state: () => ({
    currentStationData: undefined,
  }),

  actions: {
    setCurrentStationData(stationData) {
      this.currentStationData = stationData
    },
    async getStationData(stationSlug, locale = 'all') {
      const response = await axios
        .get(
          `/stations?filters[slug][$eq]=${stationSlug}&locale=${locale}`,
          axiosConfig
        )
        .catch((error) => {
          console.error(error)
          this.router.push('/error')
        })

      if (checkResponseData(response)) {
        return response.data.data[0].attributes
      } else {
        console.error('Error fetching station data')
        this.router.push('/error')
      }
    },
  },
})
