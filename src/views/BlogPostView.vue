<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BlogPostPage from '../components/blog/BlogPostPage.vue';
import { useBlog } from '../composables/useBlog';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import { getAuthUser } from '../services/vaultAuthGateway';

const route = useRoute();
const router = useRouter();
const { confirm } = useConfirmDialog();
const { getPostBySlug, getRelatedPosts, siteData, authors, removePost } = useBlog();
const authUser = getAuthUser();
const deleting = ref(false);
const errorText = ref('');

const post = computed(() => getPostBySlug(String(route.params.slug ?? '')));
const author = computed(() => {
  if (!post.value) {
    return undefined;
  }
  return authors.find((item) => item.id === post.value?.authorId);
});

const relatedPosts = computed(() => {
  if (!post.value) {
    return [];
  }
  return getRelatedPosts(post.value.slug, post.value.channel);
});

const canManage = computed(() => {
  if (!post.value || !post.value.createdByUser || !authUser) {
    return false;
  }
  if (authUser.role === 'admin') {
    return true;
  }
  return post.value.ownerUserId === authUser.id;
});

async function startEdit() {
  if (!post.value || !canManage.value) {
    return;
  }
  errorText.value = '';
  await router.push({ path: '/write', query: { edit: post.value.slug } });
}

async function handleDelete() {
  if (!post.value) {
    return;
  }

  const ok = await confirm({
    title: '确认删除文章',
    message: `你将删除《${post.value.title}》。删除后不可恢复，请再次确认。`,
    confirmText: '确认删除',
    cancelText: '我再想想',
    tone: 'danger',
  });

  if (!ok) {
    return;
  }

  deleting.value = true;
  errorText.value = '';
  try {
    await removePost(post.value.slug);
    await router.replace('/blog');
  } catch {
    errorText.value = '删除失败，请稍后再试';
  } finally {
    deleting.value = false;
  }
}

watchEffect(() => {
  if (post.value) {
    document.title = `${post.value.title} | ${siteData.name}`;
  }
});
</script>

<template>
  <div v-if="post">
    <BlogPostPage
      :site-name="siteData.name"
      :post="post"
      :author="author"
      :related-posts="relatedPosts"
      :can-manage="canManage"
      :deleting="deleting"
      @edit="startEdit"
      @delete="handleDelete"
    />
    <p v-if="errorText" class="inline-error">{{ errorText }}</p>
  </div>
  <main v-else class="not-found">
    <h1>未找到文章</h1>
    <p>你访问的文章可能已移动或删除。</p>
    <RouterLink to="/blog">返回文章库</RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  width: min(760px, calc(100% - 2rem));
  margin: 3rem auto;
  padding: 2rem;
  border-radius: 18px;
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--surface) 84%, transparent);
  display: grid;
  gap: 0.75rem;
}

.not-found h1 {
  font-family: var(--font-display);
  color: var(--ink-strong);
}

.not-found p {
  color: var(--ink-muted);
}

.not-found a {
  color: var(--accent-cyan);
  text-decoration: none;
  font-weight: 600;
}

.inline-error {
  color: #ff8686;
}

.inline-error {
  width: min(980px, calc(100% - 2rem));
  margin: 0.75rem auto 1.2rem;
}
</style>
