<script setup lang="ts">
import WriterStudioPage from '../components/blog/WriterStudioPage.vue';
import { useBlog } from '../composables/useBlog';

const { authors, publishPost, siteData } = useBlog();
</script>

<template>
  <WriterStudioPage :site-name="siteData.name" :authors="authors" :on-publish="publishPost" />
</template>
