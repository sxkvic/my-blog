<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Author, BlogPost } from '../../data/blog';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import PostCard from './PostCard.vue';

const props = defineProps<{
  siteName: string;
  post: BlogPost;
  author?: Author;
  relatedPosts: BlogPost[];
}>();

const dateText = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long' }).format(new Date(props.post.publishedAt));
});
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/blog" />
    <main class="post-main">
      <article class="post-wrap">
        <header class="post-header">
          <p class="topic">{{ post.channel }} · {{ post.category }}</p>
          <h1>{{ post.title }}</h1>
          <p class="deck">{{ post.excerpt }}</p>
          <div class="meta-row">
            <p v-if="author">作者：{{ author.name }} · {{ author.role }}</p>
            <p>{{ dateText }} · {{ post.readTime }} · {{ post.views.toLocaleString() }} 阅读</p>
          </div>
        </header>

        <div class="post-content">
          <p v-for="(paragraph, index) in post.content" :key="index">{{ paragraph }}</p>
        </div>

        <div v-if="post.media?.length" class="media-grid">
          <article v-for="(media, index) in post.media" :key="index" class="media-card">
            <img v-if="media.type === 'image'" :src="media.url" :alt="media.caption || '插图'" loading="lazy" />
            <video v-else :src="media.url" controls preload="metadata" />
            <p v-if="media.caption">{{ media.caption }}</p>
          </article>
        </div>

        <div class="tags">
          <RouterLink v-for="tag in post.tags" :key="tag" to="/blog">#{{ tag }}</RouterLink>
        </div>
      </article>

      <section v-if="relatedPosts.length" class="related">
        <header>
          <h2>相关阅读</h2>
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
  width: min(1180px, calc(100% - 2rem));
  margin: 1.4rem auto 0;
  display: grid;
  gap: 1.2rem;
}

.post-wrap {
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  padding: clamp(1rem, 2.5vw, 2rem);
}

.post-header {
  padding-bottom: 1.15rem;
  border-bottom: 1px dashed var(--line-strong);
}

.topic {
  margin: 0;
  color: var(--accent-orange);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.76rem;
}

h1 {
  margin: 0.45rem 0 0.65rem;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4.6vw, 3.3rem);
  line-height: 0.98;
}

.deck {
  margin: 0;
  color: var(--ink-muted);
  max-width: 70ch;
}

.meta-row {
  margin-top: 0.95rem;
  display: grid;
  gap: 0.25rem;
  color: var(--ink-subtle);
  font-size: 0.93rem;
}

.meta-row p {
  margin: 0;
}

.post-content {
  margin-top: 1.2rem;
  display: grid;
  gap: 0.95rem;
}

.post-content p {
  margin: 0;
  color: var(--ink);
  max-width: 72ch;
  line-height: 1.84;
  font-size: clamp(1rem, 1.4vw, 1.1rem);
}

.media-grid {
  margin-top: 1.2rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.media-card {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 0.55rem;
  background: color-mix(in srgb, var(--surface) 85%, transparent);
}

.media-card img,
.media-card video {
  width: 100%;
  border-radius: 8px;
  display: block;
}

.media-card p {
  margin-top: 0.45rem;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.tags {
  margin-top: 1.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.42rem;
}

.tags a {
  text-decoration: none;
  color: var(--ink);
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  padding: 0.34rem 0.62rem;
  font-size: 0.83rem;
}

.related {
  display: grid;
  gap: 0.75rem;
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

@media (max-width: 980px) {
  .related-grid {
    grid-template-columns: 1fr;
  }

  .media-grid {
    grid-template-columns: 1fr;
  }
}
</style>
