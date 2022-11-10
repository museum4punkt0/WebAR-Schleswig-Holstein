import { createApp, markRaw } from 'vue'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import router from '@/router'
import VueCookies from 'vue-cookies'
import i18n from '@/i18n/i18n'
import '@/assets/styles/main.css'

// Allow Pinia stores to access Vue Router instance:
const pinia = createPinia()
pinia.use(({ store }) => {
  store.router = markRaw(router)
})

createApp(App)
  .use(pinia)
  .use(router)
  .use(VueCookies, { expire: '7d' })
  .use(i18n)
  .mount('#app')
