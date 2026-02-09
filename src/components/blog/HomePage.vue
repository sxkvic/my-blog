<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Author, BlogPost } from '../../data/blog';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import PostCard from './PostCard.vue';

const props = defineProps<{
  siteName: string;
  tagline: string;
  newsletterText: string;
  posts: BlogPost[];
  featuredPosts: BlogPost[];
  authors: Author[];
  categories: string[];
  tags: string[];
  stats: {
    totalArticles: number;
    totalReaders: string;
    weeklyIssues: number;
  };
}>();

const latestPosts = computed(() => props.posts.slice(0, 6));
const topStory = computed(() => props.featuredPosts[0] ?? props.posts[0]);

function authorOf(post: BlogPost) {
  return props.authors.find((author) => author.id === post.authorId);
}
</script>

<template>
  <div class="blog-shell">
    <SiteHeader :site-name="siteName" active-path="/" />
    <main>
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Curated Weekly</p>
          <h1>{{ siteName }}</h1>
          <p class="tagline">{{ tagline }}</p>
          <div class="hero-stats">
            <p>{{ stats.totalArticles }} articles</p>
            <p>{{ stats.totalReaders }} monthly readers</p>
            <p>{{ stats.weeklyIssues }} newsletter issues</p>
          </div>
        </div>
        <RouterLink v-if="topStory" :to="`/blog/${topStory.slug}`" class="hero-story">
          <p class="story-label">Featured Story</p>
          <h2>{{ topStory.title }}</h2>
          <p>{{ topStory.excerpt }}</p>
          <span>Read feature</span>
        </RouterLink>
      </section>

      <section class="content-grid">
        <section class="main-column">
          <header class="section-head">
            <h2>Latest Articles</h2>
            <RouterLink to="/blog">View all</RouterLink>
          </header>
          <div class="posts-grid">
            <PostCard
              v-for="post in latestPosts"
              :key="post.slug"
              :post="post"
              :author="authorOf(post)"
            />
          </div>
        </section>

        <aside class="side-column">
          <section class="panel">
            <h3>Categories</h3>
            <div class="chips">
              <RouterLink v-for="category in categories" :key="category" to="/blog">
                {{ category }}
              </RouterLink>
            </div>
          </section>

          <section class="panel">
            <h3>Popular Tags</h3>
            <div class="chips chips-soft">
              <RouterLink v-for="tag in tags" :key="tag" to="/blog">#{{ tag }}</RouterLink>
            </div>
          </section>

          <section class="panel newsletter">
            <h3>Newsletter</h3>
            <p>{{ newsletterText }}</p>
            <form class="subscribe" action="#" method="post">
              <label for="email" class="sr-only">Email</label>
              <input id="email" type="email" placeholder="you@domain.com" required />
              <button type="submit">Subscribe</button>
            </form>
          </section>
        </aside>
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
main {
  width: min(1120px, calc(100% - 2rem));
  margin: 1.8rem auto 0;
  display: grid;
  gap: 2.3rem;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;
  align-items: stretch;
}

.hero-copy,
.hero-story {
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--surface);
  padding: 1.7rem;
  position: relative;
  overflow: hidden;
}

.hero-copy::before,
.hero-story::before {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--brand) 18%, transparent);
  filter: blur(1px);
  top: -70px;
  right: -30px;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--brand-deep);
  font-size: 0.8rem;
}

h1 {
  margin: 0.2rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.6vw, 3.8rem);
  line-height: 1;
  color: var(--ink-strong);
}

.tagline {
  margin: 0.9rem 0 0;
  color: var(--ink-muted);
  max-width: 52ch;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1rem;
}

.hero-stats p {
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  color: var(--ink-subtle);
  background: color-mix(in srgb, var(--surface) 70%, white 30%);
}

.hero-story {
  text-decoration: none;
  display: grid;
  align-content: start;
  gap: 0.8rem;
  transition: border-color 0.25s ease, transform 0.25s ease;
}

.hero-story:hover {
  border-color: var(--brand-deep);
  transform: translateY(-3px);
}

.story-label {
  margin: 0;
  color: var(--ink-subtle);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.hero-story h2 {
  margin: 0;
  color: var(--ink-strong);
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.7vw, 2.2rem);
  line-height: 1.12;
}

.hero-story p {
  margin: 0;
  color: var(--ink-muted);
}

.hero-story span {
  color: var(--brand-deep);
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.7fr;
  gap: 1rem;
}

.main-column,
.side-column {
  display: grid;
  gap: 1rem;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 0 0.2rem;
}

.section-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
}

.section-head a {
  color: var(--brand-deep);
  text-decoration: none;
  font-weight: 600;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.panel {
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--surface);
  padding: 1rem;
}

.panel h3 {
  margin: 0 0 0.8rem;
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chips a {
  text-decoration: none;
  font-size: 0.88rem;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
}

.chips-soft a {
  background: color-mix(in srgb, var(--brand) 14%, white 86%);
  border-color: transparent;
}

.newsletter p {
  margin: 0 0 0.9rem;
  color: var(--ink-muted);
}

.subscribe {
  display: grid;
  gap: 0.5rem;
}

.subscribe input {
  width: 100%;
  min-height: 2.5rem;
  border-radius: 12px;
  border: 1px solid var(--line-strong);
  padding: 0 0.8rem;
  font: inherit;
  background: color-mix(in srgb, var(--surface) 80%, white 20%);
}

.subscribe button {
  min-height: 2.5rem;
  border-radius: 12px;
  border: 0;
  background: var(--brand-deep);
  color: white;
  font: inherit;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.subscribe button:hover {
  opacity: 0.9;
}

@media (max-width: 1000px) {
  .hero {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  main {
    margin-top: 1.2rem;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .hero-copy,
  .hero-story {
    border-radius: 22px;
  }
}
</style>
