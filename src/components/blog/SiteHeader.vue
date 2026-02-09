<script setup lang="ts">
import { onMounted, ref } from 'vue';
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

const THEME_KEY = 'neon-theme';
const isDark = ref(false);

function applyTheme(theme: 'light' | 'neon-dark') {
  document.documentElement.setAttribute('data-theme', theme);
  isDark.value = theme === 'neon-dark';
}

function toggleTheme() {
  const next = isDark.value ? 'light' : 'neon-dark';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
}

onMounted(() => {
  const saved = localStorage.getItem(THEME_KEY) as 'light' | 'neon-dark' | null;
  if (saved === 'light' || saved === 'neon-dark') {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'neon-dark' : 'light');
});
</script>

<template>
  <header class="site-header">
    <div class="header-wrap">
      <RouterLink to="/" class="brand">{{ siteName }}</RouterLink>
      <div class="header-right">
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
        <button class="theme-toggle" type="button" @click="toggleTheme">
          <span class="dot" />
          {{ isDark ? '切换浅色' : '霓虹夜' }}
        </button>
      </div>
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

.header-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

.theme-toggle {
  min-height: 2.05rem;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  color: var(--ink);
  font: inherit;
  font-size: 0.84rem;
  padding: 0 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
}

.theme-toggle:hover {
  border-color: var(--accent-cyan);
}

.dot {
  width: 0.56rem;
  height: 0.56rem;
  border-radius: 50%;
  background: linear-gradient(130deg, var(--accent-cyan), var(--accent-orange));
  box-shadow: 0 0 10px color-mix(in srgb, var(--accent-cyan) 60%, transparent);
}

@media (max-width: 900px) {
  .header-wrap {
    align-items: start;
    padding: 0.55rem 0;
  }

  .header-right {
    flex-direction: column;
    align-items: flex-end;
  }
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
