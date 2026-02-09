<script setup lang="ts">
defineProps<{
  siteName: string;
}>();

const year = new Date().getFullYear();
</script>

<template>
  <footer class="site-footer">
    <div class="footer-wrap">
      <p class="logo">{{ siteName }}</p>
      <p class="copy">{{ year }} · Crafted for readers who build with intent.</p>
      <div class="links">
        <a href="#">X</a>
        <a href="#">GitHub</a>
        <a href="#">RSS</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: 3.5rem;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--sand) 70%, white 30%);
}

.footer-wrap {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 2.5rem;
  display: grid;
  gap: 0.75rem;
}

.logo {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
}

.copy {
  margin: 0;
  color: var(--ink-muted);
}

.links {
  display: flex;
  gap: 0.9rem;
}

.links a {
  color: var(--ink);
  text-decoration: none;
}

.links a:hover {
  color: var(--brand-deep);
}
</style>
