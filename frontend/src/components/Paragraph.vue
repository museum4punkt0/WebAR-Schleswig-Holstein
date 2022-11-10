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
  <div class="paragraph-container">
    <h2>{{ title }}</h2>
    <p>{{ text }}</p>
  </div>
</template>

<style scoped>
  .paragraph-container {
    width: 100%;
    padding: var(--gutter);
    margin-top: calc(-1 * var(--gutter));
    margin-left: calc(-1 * var(--gutter));
    color: black;
    background-color: white;
  }

  .paragraph-container h2 {
    margin-bottom: var(--gutter);
  }

  .paragraph-container p {
    margin: 0;
  }
</style>
