<script setup lang="ts">
import AboutPage from '../components/blog/AboutPage.vue';
import { siteData } from '../data/blog';
</script>

<template>
  <AboutPage :site-name="siteData.name" />
</template>
