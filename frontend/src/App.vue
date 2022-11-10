<script setup>
  import { onMounted, onBeforeMount, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import SettingsMenu from '@/components/SettingsMenu.vue'
  import Footer from '@/components/Footer.vue'
  import { useARStore } from '@/stores/ar'
  import { useMuseumStore } from '@/stores/museum'

  const arStore = useARStore()

  const museumStore = useMuseumStore()

  const route = useRoute()
  const router = useRouter()
  const museumSlug = ref(null)

  onBeforeMount(async () => {
    const mainURL = route.path.split('/')[1]
    if (
      mainURL &&
      (!museumStore.currentMuseumData ||
        museumStore.currentMuseumData?.slug !== mainURL)
    ) {
      museumSlug.value = mainURL
      await museumStore.getMuseumData(museumSlug.value).then((response) => {
        if (response) {
          // Set museum data in Store:
          museumStore.setCurrentMuseumData(response)
        } else router.push('/error')
      })
    }
  })

  onMounted(() => {
    arStore.checkMobileOS()
  })

  const showFooter = computed(() => {
    const routeParts = route.path.split('/')
    return !(
      route.path.includes('/error') ||
      routeParts[routeParts.length - 1] === 'ar'
    )
  })

  const footerData = computed(() => {
    return museumStore.currentMuseumData?.footer
  })
</script>

<template>
  <SettingsMenu />
  <RouterView />
  <Footer
    v-if="showFooter && footerData"
    :address="footerData.address"
    :google-maps-link="footerData.google_maps_link"
    :phone-number="footerData.phone_number"
    :email="footerData.email"
    :visit-info-link="footerData.visit_info_link"
    :extra-info-links="footerData.info_link"
  />
</template>

<style scoped></style>
