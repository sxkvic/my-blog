<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import type { GameVaultItem } from '../../data/blog';
import {
  createGameAccount,
  deleteGameAccount,
  listGameAccounts,
  updateGameAccount,
} from '../../services/gameVaultGateway';

const props = defineProps<{
  siteName: string;
  records: GameVaultItem[];
}>();

const vaultItems = ref<GameVaultItem[]>([]);
const keyword = ref('');
const selectedGame = ref('全部游戏');
const selectedId = ref('');
const showForm = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const visibleMap = reactive<Record<string, boolean>>({});
const copiedMap = reactive<Record<string, string>>({});
const loading = ref(false);

const formState = reactive<GameVaultItem>({
  id: '',
  game: '',
  server: '',
  account: '',
  password: '',
  role: '',
  lastLogin: new Date().toISOString().slice(0, 10),
  notes: '',
});

const gameBuckets = computed(() => {
  const map = new Map<string, number>();
  for (const item of vaultItems.value) {
    map.set(item.game, (map.get(item.game) ?? 0) + 1);
  }
  return [{ name: '全部游戏', count: vaultItems.value.length }, ...Array.from(map).map(([name, count]) => ({ name, count }))];
});

const filteredItems = computed(() => {
  const term = keyword.value.trim().toLowerCase();
  return vaultItems.value.filter((item) => {
    const gameMatch = selectedGame.value === '全部游戏' || item.game === selectedGame.value;
    const text = `${item.game} ${item.server} ${item.account} ${item.role} ${item.notes}`.toLowerCase();
    const keywordMatch = !term || text.includes(term);
    return gameMatch && keywordMatch;
  });
});

const selectedRecord = computed(() => {
  if (!selectedId.value) {
    return filteredItems.value[0];
  }
  return vaultItems.value.find((item) => item.id === selectedId.value) ?? filteredItems.value[0];
});

const stats = computed(() => {
  const games = new Set(vaultItems.value.map((item) => item.game)).size;
  return {
    totalAccounts: vaultItems.value.length,
    totalGames: games,
    shown: filteredItems.value.length,
  };
});

async function loadAccounts() {
  loading.value = true;
  try {
    const data = await listGameAccounts();
    vaultItems.value = data.length ? data : [...props.records];
  } catch {
    vaultItems.value = [...props.records];
  } finally {
    loading.value = false;
  }
}

function masked(value: string) {
  return '*'.repeat(Math.max(10, value.length));
}

function toggleVisible(id: string) {
  visibleMap[id] = !visibleMap[id];
}

async function copyText(id: string, key: 'account' | 'password', value: string) {
  await navigator.clipboard.writeText(value);
  copiedMap[id] = key;
  setTimeout(() => {
    if (copiedMap[id] === key) {
      copiedMap[id] = '';
    }
  }, 1200);
}

function openCreate() {
  formMode.value = 'create';
  Object.assign(formState, {
    id: '',
    game: selectedGame.value === '全部游戏' ? '' : selectedGame.value,
    server: '',
    account: '',
    password: '',
    role: '',
    lastLogin: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  showForm.value = true;
}

function openEdit(item: GameVaultItem) {
  formMode.value = 'edit';
  Object.assign(formState, { ...item });
  showForm.value = true;
}

async function removeItem(id: string) {
  const target = vaultItems.value.find((item) => item.id === id);
  if (!target) {
    return;
  }
  const ok = window.confirm(`确认删除 ${target.game} / ${target.account} 吗？`);
  if (!ok) {
    return;
  }

  await deleteGameAccount(id);
  vaultItems.value = vaultItems.value.filter((item) => item.id !== id);
  if (selectedId.value === id) {
    selectedId.value = '';
  }
}

async function saveForm() {
  if (!formState.game || !formState.account || !formState.password) {
    window.alert('请至少填写：游戏名、账号、密码');
    return;
  }

  const payload = {
    game: formState.game,
    server: formState.server || '未填写',
    account: formState.account,
    password: formState.password,
    role: formState.role || '未分类',
    lastLogin: formState.lastLogin || new Date().toISOString().slice(0, 10),
    notes: formState.notes || '暂无心得',
  };

  if (formMode.value === 'create') {
    const created = await createGameAccount(payload);
    vaultItems.value = [created, ...vaultItems.value];
    selectedId.value = created.id;
  } else {
    const updated = await updateGameAccount(formState.id, payload);
    vaultItems.value = vaultItems.value.map((item) => (item.id === updated.id ? updated : item));
    selectedId.value = updated.id;
  }

  showForm.value = false;
}

onMounted(() => {
  loadAccounts();
});

watch(
  () => filteredItems.value,
  (next) => {
    if (!next.length) {
      selectedId.value = '';
      return;
    }
    if (!next.some((item) => item.id === selectedId.value)) {
      selectedId.value = next[0].id;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/games" />
    <main class="games-main">
      <section class="hero reveal">
        <p class="kicker">GAME OPS CENTER</p>
        <h1>游戏仓控制台</h1>
        <p>更舒展的管理布局：左侧分组导航，右侧账号矩阵 + 详情面板，不再挤压。</p>
        <div class="stats-row">
          <p>总账号 {{ stats.totalAccounts }}</p>
          <p>游戏 {{ stats.totalGames }}</p>
          <p>当前 {{ stats.shown }}</p>
          <p v-if="loading">同步中...</p>
        </div>
      </section>

      <section class="toolbar reveal delay-1" aria-label="工具栏">
        <input v-model="keyword" type="search" placeholder="搜索账号、区服、心得..." />
        <button class="add-btn" type="button" @click="openCreate">新增账号</button>
      </section>

      <section class="workspace reveal delay-2">
        <aside class="games-rail" aria-label="游戏分组">
          <button
            v-for="bucket in gameBuckets"
            :key="bucket.name"
            type="button"
            :class="['game-pill', { active: selectedGame === bucket.name }]"
            @click="selectedGame = bucket.name"
          >
            <span>{{ bucket.name }}</span>
            <strong>{{ bucket.count }}</strong>
          </button>
        </aside>

        <section class="board">
          <section class="accounts-panel" aria-label="账号矩阵">
            <header class="table-head">
              <span>账号</span>
              <span>游戏 / 区服</span>
              <span>角色</span>
              <span>最近登录</span>
              <span>操作</span>
            </header>

            <article
              v-for="item in filteredItems"
              :key="item.id"
              :class="['table-row', { active: selectedRecord?.id === item.id }]"
              @click="selectedId = item.id"
            >
              <p class="mono">{{ item.account }}</p>
              <p>{{ item.game }} · {{ item.server }}</p>
              <p>{{ item.role }}</p>
              <p>{{ item.lastLogin }}</p>
              <div class="row-actions">
                <button type="button" @click.stop="copyText(item.id, 'account', item.account)">
                  {{ copiedMap[item.id] === 'account' ? '已复制' : '复制账号' }}
                </button>
                <button type="button" @click.stop="openEdit(item)">编辑</button>
              </div>
            </article>

            <p v-if="!filteredItems.length" class="empty">当前筛选下没有账号记录。</p>
          </section>

          <aside class="detail-panel" aria-label="详情查看">
            <template v-if="selectedRecord">
              <h2>{{ selectedRecord.game }}</h2>
              <p class="detail-meta">{{ selectedRecord.server }} · {{ selectedRecord.role }}</p>

              <div class="detail-grid">
                <p>
                  <span>账号</span>
                  <em>{{ selectedRecord.account }}</em>
                </p>
                <p>
                  <span>密码</span>
                  <em>{{ visibleMap[selectedRecord.id] ? selectedRecord.password : masked(selectedRecord.password) }}</em>
                </p>
                <p>
                  <span>最近登录</span>
                  <em>{{ selectedRecord.lastLogin }}</em>
                </p>
              </div>

              <section class="note-box">
                <h3>心得备注</h3>
                <p>{{ selectedRecord.notes }}</p>
              </section>

              <div class="detail-actions">
                <button type="button" @click="toggleVisible(selectedRecord.id)">
                  {{ visibleMap[selectedRecord.id] ? '隐藏密码' : '显示密码' }}
                </button>
                <button type="button" @click="copyText(selectedRecord.id, 'password', selectedRecord.password)">
                  {{ copiedMap[selectedRecord.id] === 'password' ? '已复制密码' : '复制密码' }}
                </button>
                <button type="button" @click="openEdit(selectedRecord)">编辑</button>
                <button class="danger" type="button" @click="removeItem(selectedRecord.id)">删除</button>
              </div>
            </template>
            <p v-else class="empty">选择账号以查看详情。</p>
          </aside>
        </section>
      </section>
    </main>

    <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
      <section class="modal">
        <h2>{{ formMode === 'create' ? '新增账号记录' : '编辑账号记录' }}</h2>
        <div class="form-grid">
          <label>
            游戏名
            <input v-model.trim="formState.game" type="text" placeholder="例如：Steam" />
          </label>
          <label>
            区服
            <input v-model.trim="formState.server" type="text" placeholder="例如：国服" />
          </label>
          <label>
            账号
            <input v-model.trim="formState.account" type="text" placeholder="账号" />
          </label>
          <label>
            密码
            <input v-model.trim="formState.password" type="text" placeholder="密码" />
          </label>
          <label>
            角色
            <input v-model.trim="formState.role" type="text" placeholder="主号 / 小号 / 排位号" />
          </label>
          <label>
            最近登录
            <input v-model="formState.lastLogin" type="date" />
          </label>
          <label class="full">
            心得备注
            <textarea v-model.trim="formState.notes" rows="4" placeholder="写点配装、阵容、游玩目标等"></textarea>
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
.games-main {
  width: min(1240px, calc(100% - 2rem));
  margin: 1.35rem auto 0;
  display: grid;
  gap: 1rem;
}

.hero,
.toolbar,
.games-rail,
.accounts-panel,
.detail-panel {
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.hero {
  padding: 1.1rem;
  background: linear-gradient(140deg, color-mix(in srgb, var(--surface) 85%, transparent), color-mix(in srgb, var(--accent-cyan) 12%, transparent));
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
  color: var(--ink-strong);
  font-size: clamp(1.72rem, 3.3vw, 2.36rem);
}

.hero > p {
  margin: 0;
  color: var(--ink-muted);
}

.stats-row {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.stats-row p {
  margin: 0;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  padding: 0.28rem 0.56rem;
  color: var(--ink-subtle);
  font-size: 0.84rem;
}

.toolbar {
  padding: 0.75rem;
  display: grid;
  grid-template-columns: 1fr 132px;
  gap: 0.6rem;
}

input,
textarea,
button {
  font: inherit;
}

.toolbar input,
.modal input,
.modal textarea {
  min-height: 2.3rem;
  border: 1px solid var(--line-strong);
  border-radius: 10px;
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink-strong);
  padding: 0 0.66rem;
}

.modal textarea {
  min-height: 7rem;
  padding: 0.55rem 0.66rem;
}

.workspace {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 0.8rem;
  align-items: start;
}

.games-rail {
  padding: 0.62rem;
  display: grid;
  gap: 0.48rem;
}

.game-pill {
  min-height: 2.45rem;
  border-radius: 12px;
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.62rem;
  cursor: pointer;
}

.game-pill.active {
  border-color: color-mix(in srgb, var(--accent-cyan) 65%, var(--line-soft));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-cyan) 25%, transparent);
}

.game-pill span {
  color: var(--ink);
}

.game-pill strong {
  color: var(--ink-subtle);
  font-family: var(--font-mono);
}

.board {
  display: grid;
  gap: 0.8rem;
}

.accounts-panel {
  padding: 0.62rem;
  display: grid;
  gap: 0.55rem;
  max-height: 56vh;
  overflow: auto;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: 1.22fr 1fr 0.9fr 0.8fr 1.15fr;
  gap: 0.52rem;
  align-items: center;
}

.table-head {
  padding: 0.45rem 0.5rem;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-subtle);
}

.table-row {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 0.58rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.table-row:hover,
.table-row.active {
  border-color: color-mix(in srgb, var(--accent-cyan) 65%, var(--line-soft));
  transform: translateY(-1px);
}

.table-row p {
  margin: 0;
  color: var(--ink);
  font-size: 0.92rem;
}

.table-row .mono {
  font-family: var(--font-mono);
}

.row-actions {
  display: flex;
  gap: 0.38rem;
  justify-content: flex-end;
}

button {
  min-height: 2.02rem;
  border-radius: 9px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  color: var(--ink);
  padding: 0 0.55rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:hover {
  border-color: var(--accent-cyan);
}

.add-btn {
  border: 0;
  background: linear-gradient(125deg, var(--accent-cyan), #58f0ff);
  color: #01212a;
  font-weight: 700;
}

.detail-panel {
  padding: 0.95rem;
  display: grid;
  gap: 0.72rem;
}

.detail-panel h2 {
  margin: 0;
  font-family: var(--font-display);
}

.detail-meta {
  margin: 0;
  color: var(--ink-subtle);
}

.detail-grid {
  display: grid;
  gap: 0.45rem;
}

.detail-grid p {
  margin: 0;
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 0.54rem;
  display: grid;
  gap: 0.22rem;
}

.detail-grid span {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-subtle);
}

.detail-grid em {
  font-style: normal;
  color: var(--ink);
  font-family: var(--font-mono);
}

.note-box {
  border: 1px solid var(--line-soft);
  border-radius: 10px;
  padding: 0.58rem;
}

.note-box h3 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--ink-strong);
}

.note-box p {
  margin: 0.45rem 0 0;
  color: var(--ink-muted);
  line-height: 1.72;
}

.detail-actions {
  display: flex;
  gap: 0.42rem;
  flex-wrap: wrap;
}

.danger {
  border-color: color-mix(in srgb, #ff5f6f 65%, var(--line-strong));
  color: #b32c3a;
}

.empty {
  margin: 0;
  color: var(--ink-subtle);
  padding: 0.5rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, #041018 72%, transparent);
  display: grid;
  place-items: center;
  z-index: 120;
}

.modal {
  width: min(760px, calc(100% - 2rem));
  border-radius: 14px;
  border: 1px solid var(--line-soft);
  background: var(--surface);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
}

.modal h2 {
  margin: 0;
  font-family: var(--font-display);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.form-grid label {
  display: grid;
  gap: 0.35rem;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.form-grid label.full {
  grid-column: 1 / -1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
}

.reveal {
  animation: reveal 0.55s ease both;
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }

@keyframes reveal {
  from { opacity: 0; transform: translateY(9px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1180px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .table-head {
    display: none;
  }

  .table-row {
    grid-template-columns: 1fr;
    gap: 0.42rem;
  }

  .row-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .toolbar {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
