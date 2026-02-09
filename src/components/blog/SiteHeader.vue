<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  siteName: string;
  activePath: string;
}>();

const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Articles' },
  { href: '/about', label: 'About' },
];
</script>

<template>
  <header class="site-header">
    <div class="header-wrap">
      <RouterLink to="/" class="brand">{{ siteName }}</RouterLink>
      <nav class="site-nav" aria-label="Primary navigation">
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
  z-index: 50;
  backdrop-filter: blur(10px);
  background: color-mix(in srgb, var(--surface) 82%, white 18%);
  border-bottom: 1px solid var(--line);
}

.header-wrap {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  min-height: 4.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  font-family: var(--font-display);
  font-size: 1.3rem;
  text-decoration: none;
  color: var(--ink-strong);
  letter-spacing: 0.04em;
}

.site-nav {
  display: flex;
  gap: 0.35rem;
}

.nav-link {
  text-decoration: none;
  color: var(--ink-muted);
  border: 1px solid transparent;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  font-size: 0.92rem;
  transition: all 0.22s ease;
}

.nav-link:hover {
  color: var(--ink-strong);
  border-color: var(--line-strong);
}

.nav-link.active {
  color: var(--ink-strong);
  border-color: var(--brand-deep);
  background: var(--brand-soft);
}

@media (max-width: 700px) {
  .brand {
    font-size: 1.1rem;
  }

  .nav-link {
    padding: 0.35rem 0.64rem;
    font-size: 0.84rem;
  }
}
</style>
