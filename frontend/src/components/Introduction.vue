<script setup>
  import { ref } from 'vue'
  defineProps({
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
  })
</script>

<template>
  <div class="intro-container">
    <h2>{{ title }}</h2>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
  .intro-container {
    width: 100%;
    padding: var(--gutter);
    margin-top: calc(-1 * var(--gutter));
    margin-left: calc(-1 * var(--gutter));
    color: black;
    background-color: white;
  }

  .intro-container h2 {
    margin-bottom: var(--gutter);
  }

  .intro-container p {
    margin: 0;
    font-size: 1.2rem;
  }
</style>
