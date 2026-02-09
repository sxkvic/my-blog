<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  siteName: string;
  activePath: string;
}>();

const links = [
  { href: '/', label: '首页' },
  { href: '/blog', label: '文章' },
  { href: '/games', label: '游戏仓' },
  { href: '/about', label: '关于我' },
];
</script>

<template>
  <header class="site-header">
    <div class="header-wrap">
      <RouterLink to="/" class="brand">{{ siteName }}</RouterLink>
      <nav class="site-nav" aria-label="主导航">
        <RouterLink
          v-for="link in links"
          :key="link.href"
          :to="link.href"
          :class="['nav-link', { active: activePath === link.href }]"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 60;
  backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--surface) 78%, transparent);
  border-bottom: 1px solid var(--line-soft);
}

.header-wrap {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  min-height: 4.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  font-family: var(--font-display);
  font-size: 1.35rem;
  text-decoration: none;
  color: var(--ink-strong);
  letter-spacing: 0.03em;
}

.site-nav {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: var(--ink-muted);
  border: 1px solid transparent;
  padding: 0.42rem 0.82rem;
  border-radius: 999px;
  font-size: 0.9rem;
  transition: all 0.25s ease;
}

.nav-link:hover {
  color: var(--ink-strong);
  border-color: var(--line-strong);
}

.nav-link.active {
  color: var(--ink-strong);
  border-color: color-mix(in srgb, var(--accent-cyan) 70%, var(--line-strong));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-cyan) 30%, transparent);
  background: color-mix(in srgb, var(--accent-cyan) 10%, var(--surface));
}

@media (max-width: 760px) {
  .header-wrap {
    min-height: 4rem;
  }

  .brand {
    font-size: 1.12rem;
  }

  .nav-link {
    font-size: 0.82rem;
    padding: 0.32rem 0.64rem;
  }
}
</style>
