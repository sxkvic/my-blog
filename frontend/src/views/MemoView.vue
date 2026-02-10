<script setup lang="ts">
import MemoPlannerPage from '../components/blog/MemoPlannerPage.vue';
import { siteData } from '../data/blog';
</script>

<template>
  <MemoPlannerPage :site-name="siteData.name" />
</template>
