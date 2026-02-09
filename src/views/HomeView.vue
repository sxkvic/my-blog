<script setup lang="ts">
import HomePage from '../components/blog/HomePage.vue';
import { useBlog } from '../composables/useBlog';

const { allPosts, authors, categories, featuredPosts, gameAccounts, popularTags, siteData, stats } = useBlog();
</script>

<template>
  <HomePage
    :site-name="siteData.name"
    :tagline="siteData.tagline"
    :newsletter-text="siteData.newsletterText"
    :posts="allPosts"
    :featured-posts="featuredPosts"
    :authors="authors"
    :categories="categories"
    :tags="popularTags"
    :game-accounts="gameAccounts"
    :stats="stats"
  />
</template>
