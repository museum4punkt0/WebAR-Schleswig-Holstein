<script setup>
  import { computed, inject } from 'vue'
  import Button from '@/components/Button.vue'
  import { useSettingsStore } from '@/stores/settings'
  import i18n from '@/i18n/i18n'

  defineProps({})

  const settings = useSettingsStore()

  const cookies = inject('$cookies')

  const privacyPolicyLink = computed(() => {
    if (i18n.global.locale === 'en') return '/privacy'
    if (i18n.global.locale === 'da') return '/data-beskyttelse'
    else return '/datenschutz'
  })

  function acceptCookies() {
    settings.setCookiesAccepted(true)
    cookies.set('cookies', true)
  }

  function rejectCookies() {
    settings.setCookiesAccepted(false)
  }
</script>

<template>
  <div class="cookie-banner-container">
    <h3>{{ $t('components.cookieBanner.title') }}</h3>
    <div class="info-text-container">
      <p>{{ $t('components.cookieBanner.text') + ' ' }}</p>
      <a :href="privacyPolicyLink">{{
        $t('components.cookieBanner.privacyPolicyLinkText')
      }}</a>
    </div>
    <div class="buttons-container">
      <Button
        type="secondary"
        :label="$t('components.cookieBanner.acceptButtonLabel')"
        class="button"
        @click="acceptCookies"
      />
      <Button
        type="secondary"
        :label="$t('components.cookieBanner.rejectButtonLabel')"
        class="button"
        @click="rejectCookies"
      />
    </div>
  </div>
</template>

<style scoped>
  .cookie-banner-container {
    position: fixed;
    right: 0;
    bottom: 0;
    z-index: 9999;
    max-width: 600px;
    padding: var(--gutter);
    color: white;
    background-color: black;
  }

  .info-text-container {
    margin-top: var(--gutter);
  }

  .info-text-container p,
  .info-text-container a {
    display: inline;
  }

  .buttons-container {
    display: flex;
    flex-direction: row;
    gap: var(--gutter);
    align-items: center;
    margin: calc(var(--gutter) * 2) 0 var(--gutter);
  }

  .button {
    max-width: var(--max-button-width);
    padding: 0;
  }

  @media screen and (max-width: 768px) {
    .cookie-banner-container {
      left: 0;
      max-width: calc(100% - (var(--gutter) * 2));
    }

    .buttons-container {
      flex-direction: column;
    }
  }
</style>
