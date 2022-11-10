<script setup></script>

<template>
  <div class="view-container">
    <div>
      <p>{{ $t('pages.error.text') }}</p>
      <router-link :to="`/`" class="return-link">{{
        $t('pages.error.linkText')
      }}</router-link>
    </div>
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
</style>
