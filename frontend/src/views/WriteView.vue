<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WriterStudioPage from '../components/blog/WriterStudioPage.vue';
import { useBlog } from '../composables/useBlog';
import type { PostDraft } from '../services/postGateway';
import { getAuthUser } from '../services/vaultAuthGateway';

const route = useRoute();
const router = useRouter();
const authUser = getAuthUser();
const { authors, getPostBySlug, init, publishPost, savePost, siteData } = useBlog();
const ready = ref(false);

const editSlug = computed(() => {
  const raw = route.query.edit;
  return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
});

const editingPost = computed(() => (editSlug.value ? getPostBySlug(editSlug.value) : undefined));
const mode = computed<'create' | 'edit'>(() => (editingPost.value ? 'edit' : 'create'));

const canEdit = computed(() => {
  if (!editingPost.value || !editingPost.value.createdByUser || !authUser) {
    return false;
  }
  if (authUser.role === 'admin') {
    return true;
  }
  return editingPost.value.ownerUserId === authUser.id;
});

async function submitPost(draft: PostDraft) {
  if (mode.value === 'edit' && editingPost.value) {
    const updated = await savePost(editingPost.value.slug, draft);
    return { slug: updated.slug };
  }
  const created = await publishPost(draft);
  return { slug: created.slug };
}

watchEffect(() => {
  document.title = mode.value === 'edit' ? `编辑文章 | ${siteData.name}` : `写作台 | ${siteData.name}`;
});

watchEffect(() => {
  if (!ready.value) {
    return;
  }
  if (!editSlug.value) {
    return;
  }
  if (!editingPost.value || !canEdit.value) {
    void router.replace('/blog');
  }
});

onMounted(async () => {
  await init();
  ready.value = true;
});
</script>

<template>
  <WriterStudioPage
    :site-name="siteData.name"
    :authors="authors"
    :mode="mode"
    :initial-post="editingPost"
    :on-submit="submitPost"
  />
</template>
