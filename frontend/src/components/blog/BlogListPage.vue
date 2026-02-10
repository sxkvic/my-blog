<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Author, BlogPost, Channel } from '../../data/blog';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import PostCard from './PostCard.vue';

const props = defineProps<{
  siteName: string;
  posts: BlogPost[];
  categories: string[];
  authors: Author[];
}>();

const activeChannel = ref<'全部' | Channel>('全部');
const activeCategory = ref('全部');

const channelItems: Array<'全部' | Channel> = ['全部', '日记', '技术心得', '游戏心得'];

const categoryItems = computed(() => ['全部', ...props.categories]);

const filteredPosts = computed(() => {
  return props.posts.filter((post) => {
    const channelMatch = activeChannel.value === '全部' || post.channel === activeChannel.value;
    const categoryMatch = activeCategory.value === '全部' || post.category === activeCategory.value;
    return channelMatch && categoryMatch;
  });
});

function authorOf(post: BlogPost) {
  return props.authors.find((author) => author.id === post.authorId);
}
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/blog" />
    <main class="blog-list-main">
      <section class="list-hero">
        <p class="kicker">ARTICLE GRID</p>
        <h1>文章库</h1>
        <p>从日记到技术心得，再到游戏复盘，全部可以筛选回看。</p>
      </section>

      <section class="toolbar" aria-label="筛选栏">
        <div class="group">
          <button
            v-for="item in channelItems"
            :key="item"
            type="button"
            :class="{ active: activeChannel === item }"
            @click="activeChannel = item"
          >
            {{ item }}
          </button>
        </div>
        <div class="group">
          <button
            v-for="item in categoryItems"
            :key="item"
            type="button"
            :class="{ active: activeCategory === item }"
            @click="activeCategory = item"
          >
            {{ item }}
          </button>
        </div>
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
  width: min(1180px, calc(100% - 2rem));
  margin: 1.4rem auto 0;
  display: grid;
  gap: 1rem;
}

.list-hero {
  border: 1px solid var(--line-soft);
  border-radius: 22px;
  padding: 1.2rem;
  background: linear-gradient(165deg, color-mix(in srgb, var(--surface) 82%, transparent), color-mix(in srgb, var(--accent-cyan) 10%, transparent));
}

.kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.74rem;
  color: var(--accent-orange);
}

h1 {
  margin: 0.45rem 0 0.35rem;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4.3vw, 3.2rem);
}

.list-hero p {
  margin-bottom: 0;
  color: var(--ink-muted);
}

.toolbar {
  display: grid;
  gap: 0.65rem;
}

.group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.48rem;
}

button {
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  color: var(--ink);
  min-height: 2.1rem;
  padding: 0 0.78rem;
  font: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  border-color: var(--line-strong);
}

button.active {
  border-color: color-mix(in srgb, var(--accent-cyan) 65%, var(--line-strong));
  color: var(--ink-strong);
  background: color-mix(in srgb, var(--accent-cyan) 14%, var(--surface));
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

@media (max-width: 980px) {
  .list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 700px) {
  .list-grid {
    grid-template-columns: 1fr;
  }
}
</style>
