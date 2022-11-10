import { createWebHistory, createRouter } from 'vue-router'
import Main from '@/views/Main.vue'
import Welcome from '@/views/Welcome.vue'
import Station from '@/views/Station.vue'
import StartAR from '@/views/StartAR.vue'
import Legal from '@/views/Legal.vue'
import Error from '@/views/Error.vue'
import Message from '@/views/Message.vue'

const routes = [
  {
    path: '/',
    component: Main,
  },
  {
    path: '/:museum',
    component: Welcome,
  },
  {
    path: '/:museum/:station',
    component: Station,
  },
  {
    path: '/:museum/:station/ar',
    component: StartAR,
  },
  {
    path: '/privacy',
    alias: ['/datenschutz', '/data-beskyttelse'],
    component: Legal,
  },
  {
    path: '/legal',
    alias: ['/impressum', '/aftryk'],
    component: Legal,
  },
  {
    path: '/accessibility',
    alias: ['/barrierefreiheit', '/tilgaengelighed'],
    component: Legal,
  },
  {
    path: '/cookies-usage',
    alias: ['/cookies-erklaerung', '/cookies-erklaering'],
    component: Legal,
  },
  {
    path: '/error',
    component: Error,
  },
  {
    path: '/ar-error',
    component: Message,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
