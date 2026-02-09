<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import BlogPostPage from '../components/blog/BlogPostPage.vue';
import { getAuthorById, getPostBySlug, getRelatedPosts, siteData } from '../data/blog';

const route = useRoute();

const post = computed(() => getPostBySlug(String(route.params.slug ?? '')));
const author = computed(() => (post.value ? getAuthorById(post.value.authorId) : undefined));
const relatedPosts = computed(() =>
  post.value ? getRelatedPosts(post.value.slug, post.value.category) : []
);

watchEffect(() => {
  if (post.value) {
    document.title = `${post.value.title} | ${siteData.name}`;
  }
});
</script>

<template>
  <BlogPostPage
    v-if="post"
    :site-name="siteData.name"
    :post="post"
    :author="author"
    :related-posts="relatedPosts"
  />
  <main v-else class="not-found">
    <h1>Article not found</h1>
    <p>The article might have been moved or deleted.</p>
    <RouterLink to="/blog">Back to articles</RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  width: min(760px, calc(100% - 2rem));
  margin: 3rem auto;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid var(--line);
  background: var(--surface);
  display: grid;
  gap: 0.75rem;
}

.not-found h1 {
  font-family: var(--font-display);
  color: var(--ink-strong);
}

.not-found p {
  color: var(--ink-muted);
}

.not-found a {
  color: var(--brand-deep);
  text-decoration: none;
  font-weight: 600;
}
</style>
