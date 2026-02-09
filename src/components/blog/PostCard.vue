<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { BlogPost, Author } from '../../data/blog';

defineProps<{
  post: BlogPost;
  author?: Author;
}>();
</script>

<template>
  <article class="post-card">
    <RouterLink :to="`/blog/${post.slug}`" class="card-link">
      <p class="meta">{{ post.category }} · {{ post.readTime }}</p>
      <h3>{{ post.title }}</h3>
      <p class="excerpt">{{ post.excerpt }}</p>
      <div class="card-footer">
        <span v-if="author" class="author">{{ author.name }}</span>
        <time :datetime="post.publishedAt">{{ post.publishedAt }}</time>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.post-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.post-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(130deg, transparent 30%, color-mix(in srgb, var(--brand) 12%, transparent));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.card-link {
  display: grid;
  gap: 0.75rem;
  padding: 1.2rem;
  text-decoration: none;
  position: relative;
  z-index: 1;
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: var(--line-strong);
  box-shadow: 0 14px 28px color-mix(in srgb, var(--ink) 10%, transparent);
}

.post-card:hover::before {
  opacity: 1;
}

.meta {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: clamp(1.2rem, 2.4vw, 1.65rem);
  line-height: 1.15;
}

.excerpt {
  margin: 0;
  color: var(--ink-muted);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--ink-subtle);
}

.author {
  font-weight: 600;
  color: var(--ink);
}
</style>
