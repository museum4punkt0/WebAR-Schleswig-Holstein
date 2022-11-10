import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (command === 'serve') {
    return {
      // Server settings to run local dev environment in HTTPS.
      // To be reviewed before deployment:
      define: {
        __VUE_I18N_FULL_INSTALL__: true,
        __VUE_I18N_LEGACY_API__: false,
        __VUE_I18N_PROD_DEVTOOLS__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
      },
      plugins: [
        vue(),
        vueI18n({
          include: path.resolve(__dirname, './src/i18n/locales/**'),
        }),
      ],
      server: {
        public: env.APP_BASE_URL,
        port: env.APP_PORT,
      },
      // Vite does not have the '@' alias to './src' by default, so we add one:
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
        },
      },
    }
  } else {
    return {
      define: {
        __VUE_I18N_FULL_INSTALL__: true,
        __VUE_I18N_LEGACY_API__: false,
        __VUE_I18N_PROD_DEVTOOLS__: false,
        __INTLIFY_PROD_DEVTOOLS__: false,
      },
      plugins: [
        vue(),
        vueI18n({
          include: path.resolve(__dirname, './src/i18n/locales/**'),
        }),
      ],
      server: {
        public: env.APP_BASE_URL,
        port: env.APP_PORT,
      },
      // Vite does not have the '@' alias to './src' by default, so we add one:
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          'vue-i18n': 'vue-i18n/dist/vue-i18n.runtime.esm-bundler.js',
        },
      },
    }
  }
})
