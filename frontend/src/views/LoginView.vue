<script setup lang="ts">
import LoginPage from '../components/blog/LoginPage.vue';
import { siteData } from '../data/blog';
</script>

<template>
  <LoginPage :site-name="siteData.name" />
</template>
