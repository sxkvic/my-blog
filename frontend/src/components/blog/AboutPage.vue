<script setup lang="ts">
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';

defineProps<{ siteName: string }>();
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/about" />
    <main class="about-main">
      <section class="about-card">
        <p class="label">ABOUT</p>
        <h1>我是一个喜欢把过程写下来的开发者。</h1>
        <p>
          这个博客不是资讯站，而是我的长期记录系统：生活日记、技术心得、游戏复盘。
        </p>
        <p>
          我希望每一篇内容都能回答一个问题：这件事下次还能复用吗？
        </p>
        <div class="facts">
          <p>建立时间：2021</p>
          <p>更新节奏：每周 2-4 篇</p>
          <p>关键词：真诚、复盘、可复用</p>
        </div>
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.about-main {
  width: min(980px, calc(100% - 2rem));
  margin: 1.4rem auto 0;
}

.about-card {
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  padding: clamp(1.15rem, 2.5vw, 2.1rem);
  background: linear-gradient(145deg, color-mix(in srgb, var(--surface) 85%, transparent), color-mix(in srgb, var(--accent-orange) 8%, transparent));
}

.label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
  color: var(--accent-orange);
}

h1 {
  margin: 0.48rem 0 0.8rem;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4.6vw, 3.2rem);
  line-height: 0.98;
}

p {
  color: var(--ink-muted);
  max-width: 64ch;
}

.facts {
  margin-top: 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.58rem;
}

.facts p {
  margin: 0;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  padding: 0.34rem 0.66rem;
  font-size: 0.9rem;
  color: var(--ink);
}
</style>
