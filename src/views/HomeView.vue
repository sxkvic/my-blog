<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import HomePage from '../components/blog/HomePage.vue';
import { useBlog } from '../composables/useBlog';

const { allPosts, authors, categories, featuredPosts, gameAccounts, popularTags, siteData, stats } = useBlog();
const LOGIN_SUCCESS_KEY = 'neo-login-success';
const showToast = ref(false);
let toastTimer = 0;

onMounted(() => {
  const marker = sessionStorage.getItem(LOGIN_SUCCESS_KEY);
  if (marker === '1') {
    sessionStorage.removeItem(LOGIN_SUCCESS_KEY);
    showToast.value = true;
    toastTimer = window.setTimeout(() => {
      showToast.value = false;
    }, 2400);
  }
});

onBeforeUnmount(() => {
  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }
});
</script>

<template>
  <div>
    <transition name="toast-fade">
      <div v-if="showToast" class="top-toast" role="status" aria-live="polite">
        登录成功，欢迎回来
      </div>
    </transition>
    <HomePage
      :site-name="siteData.name"
      :tagline="siteData.tagline"
      :newsletter-text="siteData.newsletterText"
      :posts="allPosts"
      :featured-posts="featuredPosts"
      :authors="authors"
      :categories="categories"
      :tags="popularTags"
      :game-accounts="gameAccounts"
      :stats="stats"
    />
  </div>
</template>

<style scoped>
.top-toast {
  position: fixed;
  top: 1.05rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 140;
  min-height: 2.4rem;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--accent-cyan) 60%, var(--line-soft));
  background: linear-gradient(
    125deg,
    color-mix(in srgb, var(--accent-cyan) 24%, var(--surface)),
    color-mix(in srgb, var(--surface) 90%, transparent)
  );
  color: var(--ink-strong);
  padding: 0 0.95rem;
  box-shadow: 0 12px 28px color-mix(in srgb, var(--accent-cyan) 24%, transparent);
  backdrop-filter: blur(8px);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
