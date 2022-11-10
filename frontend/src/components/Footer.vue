<script setup>
  import { ref } from 'vue'
  defineProps({
    address: {
      type: String,
      default: '',
    },
    googleMapsLink: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    visitInfoLink: {
      type: String,
      default: '',
    },
    extraInfoLinks: {
      type: Array,
      default: () => {
        return []
      },
    },
  })
</script>

<template>
  <footer class="footer-container">
    <div v-if="address" class="footer-element">
      <h4>{{ $t('components.footer.addressTitle') }}</h4>
      <a v-if="googleMapsLink" :href="googleMapsLink" target="_blank">{{
        address
      }}</a>
      <p v-else>{{ address }}</p>
    </div>
    <div v-if="phoneNumber || email" class="footer-element">
      <h4>{{ $t('components.footer.contactTitle') }}</h4>
      <p v-if="phoneNumber">{{ phoneNumber }}</p>
      <a v-if="email" :href="`mailto:${email}`">{{ email }}</a>
    </div>
    <div class="footer-element">
      <h4>{{ $t('components.footer.visitInformationTitle') }}</h4>
      <a :href="visitInfoLink">{{ visitInfoLink }}</a>
    </div>
    <div class="footer-element">
      <ul>
        <li v-for="(link, index) in extraInfoLinks" :key="index">
          <img src="@/assets/icons/arrow-white.svg" alt="" class="link-arrow" />
          <router-link v-if="link.link_url" :to="link.link_url">{{
            link.link_text
          }}</router-link>
        </li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
  .footer-container {
    width: calc(100% - (var(--gutter) * 2));
    padding: calc(var(--gutter) * 4) var(--gutter);
    color: white;
    background-color: var(--primary-color);
  }

  .footer-element {
    margin-bottom: 10%;
  }

  .footer-element h4 {
    margin-bottom: 4%;
  }

  .footer-element p {
    margin: 2% 0;
  }

  .footer-element a,
  .footer-element p {
    overflow-wrap: break-word;
  }

  .footer-element ul {
    padding: 0;
    list-style: none;
  }

  .footer-element li {
    margin: 3% 0;
  }

  .link-arrow {
    display: inline;
    height: 0.8rem;
    margin-right: 0.5rem;
    transform: rotate(180deg);
  }
</style>
