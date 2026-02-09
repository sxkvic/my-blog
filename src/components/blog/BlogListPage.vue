<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Author, BlogPost } from '../../data/blog';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import PostCard from './PostCard.vue';

const props = defineProps<{
  siteName: string;
  posts: BlogPost[];
  categories: string[];
  authors: Author[];
}>();

const activeCategory = ref('All');

const filteredPosts = computed(() => {
  if (activeCategory.value === 'All') {
    return props.posts;
  }
  return props.posts.filter((post) => post.category === activeCategory.value);
});

const categoryItems = computed(() => ['All', ...props.categories]);

function authorOf(post: BlogPost) {
  return props.authors.find((author) => author.id === post.authorId);
}
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/blog" />
    <main class="blog-list-main">
      <section class="list-hero">
        <p class="kicker">Archive</p>
        <h1>Articles for builders and operators</h1>
        <p>Browse practical writing on product, workflow, design, and growth.</p>
      </section>

      <section class="toolbar" aria-label="Category filter">
        <button
          v-for="category in categoryItems"
          :key="category"
          type="button"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </section>

      <section class="list-grid">
        <PostCard
          v-for="post in filteredPosts"
          :key="post.slug"
          :post="post"
          :author="authorOf(post)"
        />
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.blog-list-main {
  width: min(1120px, calc(100% - 2rem));
  margin: 1.8rem auto 0;
  display: grid;
  gap: 1.2rem;
}

.list-hero {
  border: 1px solid var(--line);
  border-radius: 28px;
  padding: 1.6rem;
  background: linear-gradient(150deg, color-mix(in srgb, var(--brand) 16%, var(--surface)) 0%, var(--surface) 54%);
}

.kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-size: 0.8rem;
  color: var(--brand-deep);
}

h1 {
  margin: 0.35rem 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1;
}

.list-hero p {
  margin-bottom: 0;
  color: var(--ink-muted);
  max-width: 60ch;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.toolbar button {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
  min-height: 2.2rem;
  padding: 0 0.8rem;
  font: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar button:hover {
  border-color: var(--line-strong);
}

.toolbar button.active {
  border-color: var(--brand-deep);
  background: var(--brand-soft);
  color: var(--ink-strong);
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 960px) {
  .list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .blog-list-main {
    margin-top: 1.2rem;
  }

  .list-hero {
    border-radius: 22px;
  }

  .list-grid {
    grid-template-columns: 1fr;
  }
}
</style>
