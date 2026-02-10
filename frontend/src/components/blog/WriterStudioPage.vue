<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import SiteFooter from './SiteFooter.vue';
import SiteHeader from './SiteHeader.vue';
import type { Author, BlogPost, Channel, PostMedia } from '../../data/blog';
import type { PostDraft } from '../../services/postGateway';

const props = defineProps<{
  siteName: string;
  authors: Author[];
  mode?: 'create' | 'edit';
  initialPost?: BlogPost;
  onSubmit: (draft: PostDraft) => Promise<{ slug: string }>;
}>();

const router = useRouter();
const saving = ref(false);
const defaultDate = new Date().toISOString().slice(0, 10);

const form = reactive({
  title: '',
  excerpt: '',
  channel: '技术心得' as Channel,
  category: '',
  tags: '',
  authorId: props.authors[0]?.id ?? 'kai',
  publishedAt: defaultDate,
  readTime: '6 分钟',
  contentText: '',
  imageUrl: '',
  imageCaption: '',
  videoUrl: '',
  videoCaption: '',
});

const mediaList = ref<PostMedia[]>([]);

function resetForm() {
  form.title = '';
  form.excerpt = '';
  form.channel = '技术心得';
  form.category = '';
  form.tags = '';
  form.authorId = props.authors[0]?.id ?? 'kai';
  form.publishedAt = defaultDate;
  form.readTime = '6 分钟';
  form.contentText = '';
  form.imageUrl = '';
  form.imageCaption = '';
  form.videoUrl = '';
  form.videoCaption = '';
  mediaList.value = [];
}

watch(
  () => props.initialPost,
  (post) => {
    if (!post) {
      resetForm();
      return;
    }

    form.title = post.title;
    form.excerpt = post.excerpt;
    form.channel = post.channel;
    form.category = post.category;
    form.tags = post.tags.join(', ');
    form.authorId = post.authorId;
    form.publishedAt = post.publishedAt;
    form.readTime = post.readTime;
    form.contentText = post.content.join('\n\n');
    mediaList.value = Array.isArray(post.media) ? [...post.media] : [];
  },
  { immediate: true }
);

function addImage() {
  if (!form.imageUrl.trim()) {
    return;
  }
  mediaList.value.push({ type: 'image', url: form.imageUrl.trim(), caption: form.imageCaption.trim() || undefined });
  form.imageUrl = '';
  form.imageCaption = '';
}

function addVideo() {
  if (!form.videoUrl.trim()) {
    return;
  }
  mediaList.value.push({ type: 'video', url: form.videoUrl.trim(), caption: form.videoCaption.trim() || undefined });
  form.videoUrl = '';
  form.videoCaption = '';
}

function removeMedia(index: number) {
  mediaList.value.splice(index, 1);
}

async function submit() {
  if (!form.title.trim() || !form.excerpt.trim() || !form.contentText.trim()) {
    window.alert('请至少填写：标题、摘要、正文');
    return;
  }

  saving.value = true;
  try {
    const content = form.contentText
      .split(/\n{2,}/)
      .map((item) => item.trim())
      .filter(Boolean);

    const draft: PostDraft = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      channel: form.channel,
      category: form.category.trim() || '未分类',
      tags: form.tags
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      authorId: form.authorId,
      publishedAt: form.publishedAt,
      readTime: form.readTime.trim() || '5 分钟',
      content,
      media: mediaList.value,
    };

    const created = await props.onSubmit(draft);
    await router.push(`/blog/${created.slug}`);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/write" />
    <main class="writer-main">
      <section class="writer-head">
        <p class="kicker">WRITER STUDIO</p>
        <h1>{{ mode === 'edit' ? '编辑文章' : '新建文章' }}</h1>
        <p>{{ mode === 'edit' ? '修改后保存更新到原文章。' : '写完即可发布到博客，支持插入图片和视频链接。' }}</p>
      </section>

      <section class="editor-grid">
        <article class="card">
          <h2>内容编辑</h2>
          <div class="form-grid">
            <label>
              标题
              <input v-model="form.title" type="text" placeholder="输入文章标题" />
            </label>
            <label>
              摘要
              <input v-model="form.excerpt" type="text" placeholder="一句话摘要" />
            </label>
            <label>
              栏目
              <select v-model="form.channel">
                <option value="日记">日记</option>
                <option value="技术心得">技术心得</option>
                <option value="游戏心得">游戏心得</option>
              </select>
            </label>
            <label>
              分类
              <input v-model="form.category" type="text" placeholder="例如：前端工程化" />
            </label>
            <label>
              标签（英文逗号分隔）
              <input v-model="form.tags" type="text" placeholder="Vue3, Vite, 随笔" />
            </label>
            <label>
              作者
              <select v-model="form.authorId">
                <option v-for="author in authors" :key="author.id" :value="author.id">
                  {{ author.name }} · {{ author.role }}
                </option>
              </select>
            </label>
            <label>
              发布日期
              <input v-model="form.publishedAt" type="date" />
            </label>
            <label>
              预计阅读时长
              <input v-model="form.readTime" type="text" placeholder="例如：8 分钟" />
            </label>
            <label class="full">
              正文（段落间空一行）
              <textarea v-model="form.contentText" rows="12" placeholder="在这里写正文..." />
            </label>
          </div>
        </article>

        <aside class="side-stack">
          <article class="card">
            <h2>插入图片</h2>
            <div class="stack">
              <input v-model="form.imageUrl" type="url" placeholder="https://.../image.jpg" />
              <input v-model="form.imageCaption" type="text" placeholder="图片说明（可选）" />
              <button type="button" @click="addImage">添加图片</button>
            </div>
          </article>

          <article class="card">
            <h2>插入视频</h2>
            <div class="stack">
              <input v-model="form.videoUrl" type="url" placeholder="https://.../video.mp4" />
              <input v-model="form.videoCaption" type="text" placeholder="视频说明（可选）" />
              <button type="button" @click="addVideo">添加视频</button>
            </div>
          </article>

          <article class="card">
            <h2>媒体清单</h2>
            <div class="media-list">
              <div v-for="(media, index) in mediaList" :key="`${media.type}-${index}`" class="media-row">
                <p>{{ media.type === 'image' ? '图片' : '视频' }} · {{ media.caption || '无说明' }}</p>
                <button type="button" @click="removeMedia(index)">移除</button>
              </div>
              <p v-if="!mediaList.length" class="hint">还没有媒体内容。</p>
            </div>
          </article>

          <button class="publish" type="button" :disabled="saving" @click="submit">
            {{ saving ? (mode === 'edit' ? '保存中...' : '发布中...') : (mode === 'edit' ? '保存修改' : '发布文章') }}
          </button>
        </aside>
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.writer-main {
  width: min(1240px, calc(100% - 2rem));
  margin: 1.3rem auto 0;
  display: grid;
  gap: 1rem;
}

.writer-head,
.card {
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.writer-head {
  padding: 1rem;
}

.kicker {
  margin: 0;
  color: var(--accent-orange);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0.42rem 0;
  font-family: var(--font-display);
  font-size: clamp(1.72rem, 3.2vw, 2.35rem);
  color: var(--ink-strong);
}

.writer-head p {
  margin: 0;
  color: var(--ink-muted);
}

.editor-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: 0.8rem;
}

.card {
  padding: 0.9rem;
}

.card h2 {
  margin: 0 0 0.65rem;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.form-grid label,
.stack {
  display: grid;
  gap: 0.36rem;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.form-grid label.full {
  grid-column: 1 / -1;
}

input,
select,
textarea,
button {
  font: inherit;
}

input,
select,
textarea {
  min-height: 2.3rem;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink-strong);
  padding: 0 0.66rem;
}

textarea {
  min-height: 18rem;
  padding: 0.55rem 0.66rem;
  resize: vertical;
}

button {
  min-height: 2.2rem;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  color: var(--ink);
  cursor: pointer;
}

button:hover {
  border-color: var(--accent-cyan);
}

.side-stack {
  display: grid;
  gap: 0.8rem;
  align-content: start;
}

.media-list {
  display: grid;
  gap: 0.55rem;
}

.media-row {
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 0.5rem;
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
  align-items: center;
}

.media-row p,
.hint {
  margin: 0;
  color: var(--ink-muted);
}

.publish {
  border: 0;
  background: linear-gradient(125deg, var(--accent-cyan), #58f0ff);
  color: #01212a;
  font-weight: 700;
}

.publish:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 1080px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
