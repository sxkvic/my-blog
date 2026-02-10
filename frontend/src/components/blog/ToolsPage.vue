<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import SiteFooter from './SiteFooter.vue';
import SiteHeader from './SiteHeader.vue';
import { useConfirmDialog } from '../../composables/useConfirmDialog';
import { useToolbox } from '../../composables/useToolbox';
import type { ToolLinkItem } from '../../data/tools';
import { getAuthUser } from '../../services/vaultAuthGateway';

const props = defineProps<{ siteName: string }>();
const { confirm } = useConfirmDialog();
const { links, loadToolLinks, addToolLink, editToolLink, removeToolLink, apiAvailable } = useToolbox();

const loading = ref(false);
const keyword = ref('');
const selectedCategory = ref('全部');
const showForm = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const copiedId = ref('');

const formState = reactive<ToolLinkItem>({
  id: '',
  name: '',
  url: '',
  description: '',
  category: '实用工具',
  iconText: '工',
});

const categoryBuckets = computed(() => {
  const counts = new Map<string, number>();
  for (const item of links.value) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  }

  return [
    { name: '全部', count: links.value.length },
    ...Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
  ];
});

const filteredLinks = computed(() => {
  const term = keyword.value.trim().toLowerCase();
  return links.value.filter((item) => {
    const categoryMatch = selectedCategory.value === '全部' || item.category === selectedCategory.value;
    const text = `${item.name} ${item.description} ${item.url} ${item.category}`.toLowerCase();
    return categoryMatch && (!term || text.includes(term));
  });
});

function canManage(item: ToolLinkItem) {
  if (!apiAvailable.value) {
    return false;
  }
  const currentUser = getAuthUser();
  if (!currentUser) {
    return false;
  }
  if (currentUser.role === 'admin') {
    return true;
  }
  return item.ownerUserId === currentUser.id;
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    return `${u.host}${u.pathname === '/' ? '' : u.pathname}`;
  } catch {
    return url;
  }
}

function isImageIcon(value: string) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

function openCreate() {
  formMode.value = 'create';
  Object.assign(formState, {
    id: '',
    name: '',
    url: '',
    description: '',
    category: selectedCategory.value === '全部' ? '实用工具' : selectedCategory.value,
    iconText: '工',
  });
  showForm.value = true;
}

function openEdit(item: ToolLinkItem) {
  formMode.value = 'edit';
  Object.assign(formState, { ...item });
  showForm.value = true;
}

async function copyUrl(item: ToolLinkItem) {
  await navigator.clipboard.writeText(item.url);
  copiedId.value = item.id;
  setTimeout(() => {
    if (copiedId.value === item.id) {
      copiedId.value = '';
    }
  }, 1200);
}

async function saveForm() {
  if (!formState.name.trim() || !formState.url.trim()) {
    window.alert('请至少填写：名称、链接');
    return;
  }

  const payload = {
    name: formState.name.trim(),
    url: formState.url.trim(),
    description: formState.description.trim() || '暂无描述',
    category: formState.category.trim() || '实用工具',
    iconText: (() => {
      const raw = formState.iconText.trim();
      if (!raw) {
        return formState.name.trim().slice(0, 1) || '工';
      }
      return isImageIcon(raw) ? raw : raw.slice(0, 2);
    })(),
  };

  try {
    if (formMode.value === 'create') {
      await addToolLink(payload);
    } else {
      await editToolLink(formState.id, payload);
    }
    showForm.value = false;
  } catch (error) {
    const text = error instanceof Error ? error.message : '';
    if (text.includes('tools_api_unavailable') || text.includes('404')) {
      window.alert('工具集接口不可用（/api/tools 返回 404）。请重启后端后再试。');
      return;
    }
    window.alert('保存失败，请稍后重试。');
  }
}

async function removeItem(item: ToolLinkItem) {
  const ok = await confirm({
    title: '确认删除工具',
    message: `你将删除「${item.name}」，删除后不可恢复。`,
    confirmText: '确认删除',
    cancelText: '取消',
    tone: 'danger',
  });

  if (!ok) {
    return;
  }

  try {
    await removeToolLink(item.id);
  } catch (error) {
    const text = error instanceof Error ? error.message : '';
    if (text.includes('tools_api_unavailable') || text.includes('404')) {
      window.alert('工具集接口不可用（/api/tools 返回 404）。请重启后端后再试。');
      return;
    }
    window.alert('删除失败，请稍后重试。');
  }
}

onMounted(async () => {
  loading.value = true;
  await loadToolLinks();
  loading.value = false;
});
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/tools" />

    <main class="tools-main">
      <aside class="left-rail">
        <header class="rail-head">
          <p class="kicker">LINK STACK</p>
          <h1>工具集</h1>
          <p>收藏好用网站，按分类快速检索和复用。</p>
        </header>

        <label class="search-box">
          <span class="sr-only">搜索工具</span>
          <input v-model="keyword" type="search" placeholder="搜索名称、描述、链接..." />
        </label>

        <button class="add-btn" type="button" @click="openCreate">新增工具</button>

        <nav class="category-nav" aria-label="分类导航">
          <button
            v-for="bucket in categoryBuckets"
            :key="bucket.name"
            type="button"
            :class="['category-item', { active: selectedCategory === bucket.name }]"
            @click="selectedCategory = bucket.name"
          >
            <span>{{ bucket.name }}</span>
            <strong>{{ bucket.count }}</strong>
          </button>
        </nav>
      </aside>

      <section class="content-panel">
        <p v-if="!apiAvailable" class="api-warning">
          当前后端未启用工具集接口（/api/tools）。页面显示的是本地示例数据，无法保存编辑结果。
        </p>
        <header class="content-head">
          <p>
            当前分类：<strong>{{ selectedCategory }}</strong>
          </p>
          <p>{{ filteredLinks.length }} / {{ links.length }} 项</p>
          <p v-if="loading">同步中...</p>
        </header>

        <section class="card-grid">
          <article v-for="item in filteredLinks" :key="item.id" class="tool-card">
            <div class="card-top">
              <div :class="['icon-badge', { 'icon-badge-image': isImageIcon(item.iconText) }]">
                <img
                  v-if="isImageIcon(item.iconText)"
                  :src="item.iconText"
                  :alt="`${item.name} 图标`"
                  loading="lazy"
                />
                <span v-else>{{ item.iconText }}</span>
              </div>
              <div>
                <h2>{{ item.name }}</h2>
                <p class="tag">{{ item.category }}</p>
              </div>
            </div>
            <p class="desc">{{ item.description }}</p>
            <div class="link-row">
              <a :href="item.url" target="_blank" rel="noreferrer">{{ shortUrl(item.url) }}</a>
              <button type="button" class="action-btn action-copy" @click="copyUrl(item)">
                {{ copiedId === item.id ? '已复制' : '复制' }}
              </button>
            </div>
            <div v-if="canManage(item)" class="manage-row">
              <button type="button" class="action-btn action-edit" @click="openEdit(item)">编辑</button>
              <button type="button" class="action-btn action-delete" @click="removeItem(item)">删除</button>
            </div>
          </article>
          <p v-if="!filteredLinks.length" class="empty">当前筛选下没有工具。</p>
        </section>
      </section>
    </main>

    <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
      <section class="modal">
        <h2>{{ formMode === 'create' ? '新增工具' : '编辑工具' }}</h2>
        <div class="form-grid">
          <label>
            名称
            <input v-model.trim="formState.name" type="text" placeholder="例如：Notion" />
          </label>
          <label>
            链接
            <input v-model.trim="formState.url" type="text" placeholder="https://..." />
          </label>
          <label>
            分类
            <input v-model.trim="formState.category" type="text" placeholder="例如：实用工具" />
          </label>
          <label>
            图标（字母或图片 URL）
            <input v-model.trim="formState.iconText" type="text" placeholder="例如：N 或 https://.../logo.png" />
          </label>
          <label class="full">
            描述
            <textarea v-model.trim="formState.description" rows="4" placeholder="一句话说明用途" />
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" @click="showForm = false">取消</button>
          <button class="add-btn" type="button" @click="saveForm">保存</button>
        </div>
      </section>
    </div>

    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.tools-main {
  width: min(1260px, calc(100% - 2rem));
  margin: 1.25rem auto 0;
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 0.85rem;
}

.left-rail,
.content-panel {
  border: 1px solid var(--line-soft);
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
}

.left-rail {
  padding: 0.95rem;
  position: sticky;
  top: 5.4rem;
  align-self: start;
  display: grid;
  gap: 0.65rem;
}

.kicker {
  margin: 0;
  color: var(--accent-orange);
  letter-spacing: 0.08em;
  font-size: 0.72rem;
}

h1 {
  margin: 0.35rem 0 0.4rem;
  font-family: var(--font-display);
  font-size: 2rem;
  line-height: 1;
  color: var(--ink-strong);
}

.rail-head p {
  margin: 0;
  color: var(--ink-muted);
}

.search-box input {
  width: 100%;
}

input,
textarea,
button {
  font: inherit;
}

input,
textarea {
  min-height: 2.2rem;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  padding: 0 0.65rem;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink-strong);
}

textarea {
  padding: 0.55rem 0.65rem;
  resize: vertical;
}

.add-btn {
  min-height: 2.2rem;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(125deg, var(--accent-cyan), #66eeff);
  color: #01212a;
  font-weight: 700;
}

.category-nav {
  display: grid;
  gap: 0.42rem;
  max-height: 58vh;
  overflow: auto;
  padding-right: 0.18rem;
}

.category-item {
  min-height: 2.1rem;
  border-radius: 10px;
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  color: var(--ink);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.62rem;
  cursor: pointer;
}

.category-item strong {
  color: var(--ink-muted);
}

.category-item.active {
  border-color: color-mix(in srgb, var(--accent-cyan) 65%, var(--line-strong));
  background: color-mix(in srgb, var(--accent-cyan) 14%, var(--surface));
}

.content-panel {
  padding: 0.9rem;
  display: grid;
  gap: 0.8rem;
}

.api-warning {
  margin: 0;
  border: 1px solid #ffc8c8;
  border-radius: 10px;
  background: #fff1f1;
  color: #9a3e49;
  padding: 0.55rem 0.7rem;
}

.content-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 1rem;
  color: var(--ink-muted);
}

.content-head p {
  margin: 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.tool-card {
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  padding: 0.78rem;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  display: grid;
  gap: 0.55rem;
}

.card-top {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.65rem;
  align-items: center;
}

.icon-badge {
  width: 2.15rem;
  height: 2.15rem;
  border-radius: 9px;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #eff9ff;
  background: linear-gradient(145deg, #3d5f8f, #2a4f80);
  overflow: hidden;
}

.icon-badge-image {
  background: transparent;
  box-shadow: none;
}

.icon-badge img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

h2 {
  margin: 0;
  font-size: 1.32rem;
  color: var(--ink-strong);
  line-height: 1.1;
}

.tag {
  margin-top: 0.22rem;
  display: inline-flex;
  min-height: 1.3rem;
  border-radius: 999px;
  padding: 0 0.45rem;
  align-items: center;
  font-size: 0.78rem;
  color: #4c6077;
  background: #efe9dc;
}

.desc {
  margin: 0;
  color: var(--ink-muted);
  min-height: 2.8rem;
}

.link-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  align-items: center;
}

.link-row a {
  color: #3e5f8f;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: calc(100% - 5rem);
}

.modal-actions button {
  min-height: 1.95rem;
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  background: #d6efe3;
  color: #1f6e4f;
  padding: 0 0.62rem;
  cursor: pointer;
}

.manage-row {
  display: flex;
  justify-content: flex-end;
  gap: 0.42rem;
  padding-top: 0.12rem;
}

.action-btn {
  min-width: 3.3rem;
  min-height: 2rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--line-soft) 92%, transparent);
  font-size: 0.86rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px color-mix(in srgb, var(--accent-cyan) 16%, transparent);
}

.action-copy {
  background: linear-gradient(125deg, #d8f4e8, #c6ecde);
  color: #1f6e4f;
}

.action-edit {
  background: linear-gradient(125deg, #d8f4e8, #bde5d5);
  color: #1f6e4f;
}

.action-delete {
  background: linear-gradient(125deg, #ffe9e9, #ffd8d8);
  color: #8b2f3c;
}

.action-delete:hover {
  box-shadow: 0 8px 18px color-mix(in srgb, #ff8f9f 22%, transparent);
}

.empty {
  margin: 0;
  color: var(--ink-muted);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, #0a1218 38%, transparent);
  display: grid;
  place-items: center;
  z-index: 120;
  padding: 1rem;
}

.modal {
  width: min(680px, 100%);
  border: 1px solid var(--line-soft);
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  padding: 0.95rem;
  display: grid;
  gap: 0.75rem;
}

.modal h2 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

label {
  display: grid;
  gap: 0.32rem;
  color: var(--ink-muted);
  font-size: 0.88rem;
}

label.full {
  grid-column: 1 / -1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.52rem;
}

.modal-actions button:first-child {
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink);
}

@media (max-width: 1120px) {
  .tools-main {
    grid-template-columns: 1fr;
  }

  .left-rail {
    position: static;
  }

  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .card-grid,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
