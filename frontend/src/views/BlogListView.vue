<script setup lang="ts">
import BlogListPage from '../components/blog/BlogListPage.vue';
import { useBlog } from '../composables/useBlog';

const { allPosts, authors, categories, siteData } = useBlog();
</script>

<template>
  <BlogListPage
    :site-name="siteData.name"
    :posts="allPosts"
    :categories="categories"
    :authors="authors"
  />
</template>
