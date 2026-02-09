<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{ siteName: string }>();
const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="footer-wrap">
      <p class="logo">{{ siteName }}</p>
      <p class="copy">{{ year }} · 生活、技术、游戏都值得被认真记录。</p>
      <div class="links">
        <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        <RouterLink to="/memo">备忘录</RouterLink>
        <RouterLink to="/games">游戏仓</RouterLink>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 3.8rem;
  border-top: 1px solid var(--line-soft);
  background: linear-gradient(180deg, color-mix(in srgb, var(--surface) 75%, transparent), transparent);
}

.footer-wrap {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2.2rem 0 2.8rem;
  display: grid;
  gap: 0.75rem;
}

.logo {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.08rem;
}

.copy {
  margin: 0;
  color: var(--ink-muted);
}

.links {
  display: flex;
  gap: 0.9rem;
  flex-wrap: wrap;
}

.links a {
  color: var(--ink);
  text-decoration: none;
}

.links a:hover {
  color: var(--accent-cyan);
}
</style>
