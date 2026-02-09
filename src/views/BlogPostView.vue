<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BlogPostPage from '../components/blog/BlogPostPage.vue';
import { useBlog } from '../composables/useBlog';
import { useConfirmDialog } from '../composables/useConfirmDialog';
import {
  createPostComment,
  deletePostComment,
  listPostComments,
  type PostComment,
} from '../services/postCommentGateway';
import { getAuthUser } from '../services/vaultAuthGateway';

const route = useRoute();
const router = useRouter();
const { confirm } = useConfirmDialog();
const { getPostBySlug, getRelatedPosts, siteData, authors, removePost } = useBlog();
const authUser = getAuthUser();
const deleting = ref(false);
const errorText = ref('');
const comments = ref<PostComment[]>([]);
const commentText = ref('');
const loadingComments = ref(false);
const submittingComment = ref(false);
const deletingCommentId = ref('');
const commentError = ref('');

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

function canDeleteComment(comment: PostComment) {
  if (!authUser) {
    return false;
  }
  if (authUser.role === 'admin') {
    return true;
  }
  return authUser.id === comment.ownerUserId;
}

const canComment = computed(() => Boolean(authUser));

async function loadComments() {
  if (!post.value) {
    comments.value = [];
    return;
  }

  loadingComments.value = true;
  commentError.value = '';
  try {
    comments.value = await listPostComments(post.value.slug);
  } catch {
    comments.value = [];
    commentError.value = '评论加载失败，请稍后刷新重试';
  } finally {
    loadingComments.value = false;
  }
}

async function submitComment() {
  if (!post.value) {
    return;
  }
  if (!canComment.value) {
    await router.push({ path: '/login', query: { redirect: route.fullPath } });
    return;
  }

  const content = commentText.value.trim();
  if (!content) {
    commentError.value = '评论内容不能为空';
    return;
  }

  submittingComment.value = true;
  commentError.value = '';
  try {
    const created = await createPostComment(post.value.slug, content);
    comments.value = [created, ...comments.value];
    commentText.value = '';
  } catch {
    commentError.value = '评论发布失败，请稍后再试';
  } finally {
    submittingComment.value = false;
  }
}

async function handleDeleteComment(comment: PostComment) {
  if (!post.value || !canDeleteComment(comment)) {
    return;
  }

  const ok = await confirm({
    title: '确认删除评论',
    message: '删除后不可恢复，确认继续吗？',
    confirmText: '确认删除',
    cancelText: '取消',
    tone: 'danger',
  });
  if (!ok) {
    return;
  }

  deletingCommentId.value = comment.id;
  commentError.value = '';
  try {
    await deletePostComment(post.value.slug, comment.id);
    comments.value = comments.value.filter((item) => item.id !== comment.id);
  } catch {
    commentError.value = '删除评论失败，请稍后再试';
  } finally {
    deletingCommentId.value = '';
  }
}

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) {
    return value;
  }
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

watchEffect(() => {
  if (post.value) {
    document.title = `${post.value.title} | ${siteData.name}`;
  }
});

watchEffect(() => {
  if (post.value?.slug) {
    void loadComments();
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
    >
      <template #comments>
        <section class="comments">
          <header class="comments-head">
            <h2>评论留言</h2>
            <p>{{ comments.length }} 条</p>
          </header>

          <form class="comment-form" @submit.prevent="submitComment">
            <textarea
              v-model.trim="commentText"
              rows="4"
              placeholder="写下你的想法..."
              :disabled="submittingComment"
            />
            <div class="comment-actions">
              <p v-if="!canComment" class="hint">
                需要登录后发表评论。
                <RouterLink :to="{ path: '/login', query: { redirect: route.fullPath } }">去登录</RouterLink>
              </p>
              <button type="submit" :disabled="submittingComment">
                {{ submittingComment ? '发布中...' : '发布评论' }}
              </button>
            </div>
          </form>

          <p v-if="loadingComments" class="hint">评论加载中...</p>
          <p v-if="commentError" class="comment-error">{{ commentError }}</p>

          <div class="comment-list">
            <article v-for="item in comments" :key="item.id" class="comment-item">
              <header>
                <strong>{{ item.username }}</strong>
                <time :datetime="item.createdAt">{{ formatCommentTime(item.createdAt) }}</time>
              </header>
              <p>{{ item.content }}</p>
              <div v-if="canDeleteComment(item)" class="row-actions">
                <button
                  type="button"
                  class="danger"
                  :disabled="deletingCommentId === item.id"
                  @click="handleDeleteComment(item)"
                >
                  {{ deletingCommentId === item.id ? '删除中...' : '删除' }}
                </button>
              </div>
            </article>
          </div>
        </section>
      </template>
    </BlogPostPage>
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

.comments {
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background:
    radial-gradient(260px 180px at 0% 0%, color-mix(in srgb, var(--accent-cyan) 14%, transparent), transparent 68%),
    color-mix(in srgb, var(--surface) 90%, transparent);
  padding: 0.85rem;
  display: grid;
  gap: 0.65rem;
}

.comments-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.comments-head h2 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: 1.25rem;
}

.comments-head p {
  margin: 0;
  color: var(--ink-muted);
}

.comment-form {
  display: grid;
  gap: 0.5rem;
}

textarea,
button {
  font: inherit;
}

textarea {
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  padding: 0.52rem 0.62rem;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink-strong);
  resize: vertical;
  min-height: 5.6rem;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.6rem;
}

.comment-actions button {
  min-height: 2rem;
  border-radius: 10px;
  border: 0;
  padding: 0 0.85rem;
  cursor: pointer;
  font-weight: 700;
  background: linear-gradient(125deg, var(--accent-cyan), #66eeff);
  color: #01212a;
}

.comment-actions button:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.hint {
  margin: 0;
  color: var(--ink-muted);
}

.hint a {
  color: var(--accent-cyan);
  text-decoration: none;
}

.comment-list {
  display: grid;
  gap: 0.5rem;
  max-height: 56vh;
  overflow: auto;
  padding-right: 0.2rem;
}

.comment-item {
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 0.58rem;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  display: grid;
  gap: 0.45rem;
}

.comment-item header {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  align-items: baseline;
}

.comment-item strong {
  color: var(--ink-strong);
}

.comment-item time {
  color: var(--ink-subtle);
  font-size: 0.86rem;
}

.comment-item p {
  margin: 0;
  color: var(--ink);
  line-height: 1.6;
  font-size: 0.92rem;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
}

.row-actions button {
  min-height: 1.8rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #ffb0b8 65%, var(--line-soft));
  background: #ffe7ea;
  color: #8e2f3c;
  padding: 0 0.75rem;
  cursor: pointer;
}

.row-actions button:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.comment-error {
  margin: 0;
  color: #ff8686;
}
</style>
