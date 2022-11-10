import { createI18n } from 'vue-i18n'
import { reactive } from 'vue'

import messages from '@intlify/vite-plugin-vue-i18n/messages'

// Create the VueI18n instance:
const i18n = reactive(
  createI18n({
    legacy: false, // to use Composition API only
    globalInjection: true,
    fallbackLocale: 'de',
    locale: 'de',
    messages,
  })
)

export default i18n
