<script setup lang="ts">
import ToolsPage from '../components/blog/ToolsPage.vue';
import { useBlog } from '../composables/useBlog';

const { siteData } = useBlog();
</script>

<template>
  <ToolsPage :site-name="siteData.name" />
</template>
