<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import type { Author, BlogPost, GameVaultItem } from '../../data/blog';
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
  gameAccounts: GameVaultItem[];
  stats: {
    totalArticles: number;
    totalReaders: string;
    weeklyIssues: number;
  };
}>();

const latestPosts = computed(() => props.posts.slice(0, 6));
const topStory = computed(() => props.featuredPosts[0] ?? props.posts[0]);
const gameSnapshot = computed(() => props.gameAccounts.slice(0, 3));

function authorOf(post: BlogPost) {
  return props.authors.find((author) => author.id === post.authorId);
}
</script>

<template>
  <div class="blog-shell">
    <SiteHeader :site-name="siteName" active-path="/" />
    <main>
      <section class="hero">
        <div class="hero-main reveal">
          <p class="kicker">PERSONAL STATION / CN</p>
          <h1>把生活、技术、游戏都写成可回放的轨迹。</h1>
          <p class="tagline">{{ tagline }}</p>
          <div class="hero-actions">
            <RouterLink to="/write" class="action-primary">开始写作</RouterLink>
            <RouterLink to="/blog" class="action-ghost">浏览文章</RouterLink>
          </div>
          <div class="metrics">
            <p>{{ stats.totalArticles }} 篇记录</p>
            <p>{{ stats.totalReaders }} 月访问</p>
            <p>{{ stats.weeklyIssues }} 周刊归档</p>
          </div>
        </div>
        <RouterLink v-if="topStory" :to="`/blog/${topStory.slug}`" class="hero-side reveal delay-1">
          <p class="side-label">本周主打</p>
          <h2>{{ topStory.title }}</h2>
          <p>{{ topStory.excerpt }}</p>
          <span>打开文章 →</span>
        </RouterLink>
      </section>

      <section class="ticker reveal delay-2" aria-label="滚动标签">
        <div class="ticker-inner">
          <span v-for="tag in tags" :key="tag">#{{ tag }}</span>
          <span v-for="tag in tags" :key="`repeat-${tag}`">#{{ tag }}</span>
        </div>
      </section>

      <section class="content-grid">
        <section class="main-column">
          <header class="section-head">
            <h2>最新记录</h2>
            <RouterLink to="/blog">查看全部</RouterLink>
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
          <section class="panel reveal delay-1">
            <h3>栏目导航</h3>
            <div class="chips">
              <RouterLink to="/blog">日记 / 技术 / 游戏心得</RouterLink>
              <RouterLink to="/games">游戏账号仓</RouterLink>
            </div>
          </section>

          <section class="panel reveal delay-2">
            <h3>游戏快照</h3>
            <div class="game-list">
              <article v-for="item in gameSnapshot" :key="item.id" class="game-item">
                <p class="game-title">{{ item.game }} · {{ item.server }}</p>
                <p>{{ item.role }}</p>
              </article>
            </div>
            <RouterLink class="game-link" to="/games">进入完整游戏仓</RouterLink>
          </section>

          <section class="panel newsletter reveal delay-3">
            <h3>订阅更新</h3>
            <p>{{ newsletterText }}</p>
            <form class="subscribe" action="#" method="post" @submit.prevent>
              <label for="email" class="sr-only">邮箱</label>
              <input id="email" type="email" placeholder="name@email.com" required />
              <button type="submit">订阅</button>
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
  width: min(1180px, calc(100% - 2rem));
  margin: 1.4rem auto 0;
  display: grid;
  gap: 1.1rem;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 1rem;
}

.hero-main,
.hero-side {
  border-radius: 24px;
  border: 1px solid var(--line-soft);
  background: linear-gradient(165deg, color-mix(in srgb, var(--surface) 82%, transparent), color-mix(in srgb, var(--panel-ink) 10%, transparent));
  padding: 1.4rem;
  position: relative;
  overflow: hidden;
}

.hero-main::after,
.hero-side::after {
  content: '';
  position: absolute;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--accent-cyan) 24%, transparent);
  right: -60px;
  top: -70px;
  filter: blur(8px);
}

.kicker {
  margin: 0;
  color: var(--accent-orange);
  letter-spacing: 0.08em;
  font-size: 0.74rem;
}

h1 {
  margin: 0.4rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.62rem, 3.25vw, 2.75rem);
  line-height: 1.04;
  color: var(--ink-strong);
  max-width: 16ch;
}

.tagline {
  margin-top: 0.8rem;
  color: var(--ink-muted);
  max-width: 52ch;
}

.hero-actions {
  margin-top: 0.9rem;
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.hero-actions a {
  text-decoration: none;
  min-height: 2.2rem;
  border-radius: 999px;
  padding: 0 0.85rem;
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line-soft);
}

.action-primary {
  border: 0 !important;
  background: linear-gradient(125deg, var(--accent-cyan), #58f0ff);
  color: #01212a;
  font-weight: 700;
}

.action-ghost {
  color: var(--ink);
}

.metrics {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.metrics p {
  margin: 0;
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  padding: 0.34rem 0.66rem;
  color: var(--ink-subtle);
  font-size: 0.9rem;
}

.hero-side {
  text-decoration: none;
  display: grid;
  align-content: start;
  gap: 0.75rem;
  transition: transform 0.26s ease, border-color 0.26s ease;
}

.hero-side:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--accent-cyan) 60%, var(--line-soft));
  box-shadow: 0 18px 36px color-mix(in srgb, var(--accent-cyan) 22%, transparent);
}

.side-label {
  margin: 0;
  color: var(--ink-subtle);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.74rem;
}

.hero-side h2 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(1.5rem, 2.8vw, 2.2rem);
  line-height: 1.05;
}

.hero-side p {
  margin: 0;
  color: var(--ink-muted);
}

.hero-side span {
  color: var(--accent-cyan);
  font-weight: 700;
}

.ticker {
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  overflow: hidden;
  background: color-mix(in srgb, var(--surface) 78%, transparent);
}

.ticker-inner {
  display: flex;
  width: max-content;
  gap: 1.2rem;
  padding: 0.55rem 0.9rem;
  color: var(--ink-muted);
  animation: move 20s linear infinite;
}

@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.content-grid {
  display: grid;
  grid-template-columns: 1.45fr 0.72fr;
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
  align-items: center;
  padding: 0 0.1rem;
}

.section-head h2 {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 2.3vw, 2rem);
}

.section-head a {
  text-decoration: none;
  color: var(--accent-cyan);
  font-weight: 600;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.panel {
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  padding: 1rem;
  transition: transform 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.panel:hover {
  transform: translateY(-3px);
  border-color: color-mix(in srgb, var(--accent-cyan) 55%, var(--line-soft));
  box-shadow: 0 12px 30px color-mix(in srgb, var(--accent-cyan) 14%, transparent);
}

.panel h3 {
  margin: 0 0 0.8rem;
  font-family: var(--font-display);
  font-size: 1.2rem;
}

.chips {
  display: grid;
  gap: 0.6rem;
}

.chips a {
  text-decoration: none;
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 0.6rem 0.7rem;
}

.game-list {
  display: grid;
  gap: 0.65rem;
}

.game-item {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 0.62rem;
  display: grid;
  gap: 0.2rem;
}

.game-title {
  font-weight: 700;
  color: var(--ink-strong);
}

.game-item p {
  margin: 0;
  color: var(--ink-muted);
}

.game-link {
  margin-top: 0.75rem;
  display: inline-block;
  color: var(--accent-cyan);
  text-decoration: none;
  font-weight: 600;
}

.newsletter p {
  color: var(--ink-muted);
  margin: 0 0 0.8rem;
}

.subscribe {
  display: grid;
  gap: 0.5rem;
}

.subscribe input {
  min-height: 2.4rem;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink-strong);
  padding: 0 0.72rem;
  font: inherit;
}

.subscribe button {
  min-height: 2.4rem;
  border-radius: 10px;
  border: 0;
  font: inherit;
  color: #00161d;
  background: var(--accent-cyan);
  font-weight: 700;
  cursor: pointer;
}

.reveal {
  animation: reveal 0.65s ease both;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1020px) {
  .hero,
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }

  .hero-main,
  .hero-side {
    border-radius: 18px;
  }
}
</style>
