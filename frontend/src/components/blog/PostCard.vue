<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Author, BlogPost } from '../../data/blog';

const props = defineProps<{
  post: BlogPost;
  author?: Author;
}>();

const dateText = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium' }).format(new Date(props.post.publishedAt));
});
</script>

<template>
  <article class="post-card">
    <RouterLink :to="`/blog/${props.post.slug}`" class="card-link">
      <p class="meta">{{ props.post.channel }} · {{ props.post.readTime }}</p>
      <h3>{{ props.post.title }}</h3>
      <p class="excerpt">{{ props.post.excerpt }}</p>
      <div class="card-footer">
        <span v-if="props.author" class="author">{{ props.author.name }}</span>
        <time :datetime="props.post.publishedAt">{{ dateText }}</time>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.post-card {
  border-radius: 18px;
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  position: relative;
  overflow: hidden;
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.post-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(130deg, transparent 40%, color-mix(in srgb, var(--accent-cyan) 16%, transparent));
  opacity: 0;
  transition: opacity 0.25s ease;
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent-cyan) 65%, var(--line-soft));
}

.post-card:hover::before {
  opacity: 1;
}

.card-link {
  display: grid;
  gap: 0.76rem;
  text-decoration: none;
  padding: 1rem;
  position: relative;
  z-index: 1;
}

.meta {
  margin: 0;
  color: var(--accent-orange);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(1.16rem, 2.2vw, 1.52rem);
  line-height: 1.14;
}

.excerpt {
  margin: 0;
  color: var(--ink-muted);
}

.card-footer {
  margin-top: 0.18rem;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  color: var(--ink-subtle);
  font-size: 0.88rem;
}

.author {
  color: var(--ink);
  font-weight: 700;
}
</style>
