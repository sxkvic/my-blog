<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Author, BlogPost } from '../../data/blog';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import PostCard from './PostCard.vue';

defineProps<{
  siteName: string;
  post: BlogPost;
  author?: Author;
  relatedPosts: BlogPost[];
}>();
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/blog" />
    <main class="post-main">
      <article class="post-wrap">
        <header class="post-header">
          <p class="topic">{{ post.category }}</p>
          <h1>{{ post.title }}</h1>
          <p class="deck">{{ post.excerpt }}</p>
          <div class="meta-row">
            <p v-if="author">By {{ author.name }} · {{ author.role }}</p>
            <p>{{ post.publishedAt }} · {{ post.readTime }} · {{ post.views.toLocaleString() }} views</p>
          </div>
        </header>

        <div class="post-content">
          <p v-for="(paragraph, index) in post.content" :key="index">{{ paragraph }}</p>
        </div>

        <div class="tags">
          <RouterLink v-for="tag in post.tags" :key="tag" to="/blog">#{{ tag }}</RouterLink>
        </div>
      </article>

      <section v-if="relatedPosts.length" class="related">
        <header>
          <h2>Related Reading</h2>
        </header>
        <div class="related-grid">
          <PostCard v-for="related in relatedPosts" :key="related.slug" :post="related" />
        </div>
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.post-main {
  width: min(1120px, calc(100% - 2rem));
  margin: 1.6rem auto 0;
  display: grid;
  gap: 1.5rem;
}

.post-wrap {
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--surface);
  padding: clamp(1rem, 2.2vw, 2rem);
}

.post-header {
  padding-bottom: 1.2rem;
  border-bottom: 1px dashed var(--line-strong);
}

.topic {
  margin: 0;
  color: var(--brand-deep);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
}

h1 {
  margin: 0.4rem 0 0.65rem;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4vw, 3.1rem);
  line-height: 1;
}

.deck {
  margin: 0;
  color: var(--ink-muted);
  max-width: 70ch;
}

.meta-row {
  margin-top: 1rem;
  display: grid;
  gap: 0.3rem;
  color: var(--ink-subtle);
  font-size: 0.94rem;
}

.meta-row p {
  margin: 0;
}

.post-content {
  margin-top: 1.2rem;
  display: grid;
  gap: 1rem;
}

.post-content p {
  margin: 0;
  color: var(--ink);
  max-width: 72ch;
  line-height: 1.76;
  font-size: clamp(1rem, 1.3vw, 1.12rem);
}

.tags {
  margin-top: 1.6rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.tags a {
  text-decoration: none;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.34rem 0.64rem;
  font-size: 0.84rem;
}

.related {
  display: grid;
  gap: 0.8rem;
}

.related h2 {
  margin: 0;
  font-family: var(--font-display);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 960px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .post-main {
    margin-top: 1.1rem;
  }

  .post-wrap {
    border-radius: 22px;
  }
}
</style>
