<script setup lang="ts">
import BlogListPage from '../components/blog/BlogListPage.vue';
import { authors, categories, posts, siteData } from '../data/blog';
</script>

<template>
  <BlogListPage
    :site-name="siteData.name"
    :posts="posts"
    :categories="categories"
    :authors="authors"
  />
</template>
