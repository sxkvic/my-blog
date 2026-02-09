<script setup lang="ts">
import HomePage from '../components/blog/HomePage.vue';
import {
  authors,
  categories,
  featuredPosts,
  gameAccounts,
  popularTags,
  posts,
  siteData,
  siteStats,
} from '../data/blog';
</script>

<template>
  <HomePage
    :site-name="siteData.name"
    :tagline="siteData.tagline"
    :newsletter-text="siteData.newsletterText"
    :posts="posts"
    :featured-posts="featuredPosts"
    :authors="authors"
    :categories="categories"
    :tags="popularTags"
    :game-accounts="gameAccounts"
    :stats="siteStats"
  />
</template>
