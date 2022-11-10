<script setup>
  import Button from '@/components/Button.vue'
</script>

<template>
  <div class="view-container">
    <img src="@/assets/images/other/broken.svg" alt="" />
    <p>{{ $t('pages.arError.text') }}</p>
    <Button
      type="primary"
      :label="$t('pages.arError.buttonLabel')"
      :options="['back-icon']"
      route="/"
      class="button"
    />
  </div>
</template>

<style scoped>
  .view-container {
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
    align-items: center;
    justify-content: center;
    height: calc(100vh - (var(--gutter) * 2) - var(--settings-bar-height));
  }

  .view-container p,
  a {
    margin-top: 0;
    text-align: center;
  }

  .view-container a {
    font-family: 'OpenSans SemiBold', sans-serif;
  }

  .button {
    max-width: var(--max-button-width);
  }
</style>
