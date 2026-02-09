<script setup lang="ts">
import { reactive } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import type { GameVaultItem } from '../../data/blog';

defineProps<{
  siteName: string;
  records: GameVaultItem[];
}>();

const visibleMap = reactive<Record<string, boolean>>({});
const copiedMap = reactive<Record<string, string>>({});

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

function masked(value: string) {
  return '*'.repeat(Math.max(8, value.length));
}
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/games" />
    <main class="games-main">
      <section class="hero">
        <p class="kicker">GAME VAULT</p>
        <h1>游戏账号仓</h1>
        <p>记录账号、密码与游玩心得。数据仅在本地项目中展示，请自行做好安全管理。</p>
      </section>

      <section class="records" aria-label="游戏账号记录">
        <article v-for="item in records" :key="item.id" class="record-card">
          <header>
            <h2>{{ item.game }}</h2>
            <p>{{ item.server }} · {{ item.role }}</p>
          </header>

          <div class="record-grid">
            <div>
              <label>账号</label>
              <p>{{ item.account }}</p>
            </div>
            <div class="actions">
              <button type="button" @click="copyText(item.id, 'account', item.account)">
                {{ copiedMap[item.id] === 'account' ? '已复制' : '复制账号' }}
              </button>
            </div>
            <div>
              <label>密码</label>
              <p>{{ visibleMap[item.id] ? item.password : masked(item.password) }}</p>
            </div>
            <div class="actions">
              <button type="button" @click="toggleVisible(item.id)">
                {{ visibleMap[item.id] ? '隐藏密码' : '显示密码' }}
              </button>
              <button type="button" @click="copyText(item.id, 'password', item.password)">
                {{ copiedMap[item.id] === 'password' ? '已复制' : '复制密码' }}
              </button>
            </div>
          </div>

          <footer>
            <p>最近登录：{{ item.lastLogin }}</p>
            <p>心得：{{ item.notes }}</p>
          </footer>
        </article>
      </section>
    </main>
    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.games-main {
  width: min(1180px, calc(100% - 2rem));
  margin: 1.4rem auto 0;
  display: grid;
  gap: 1rem;
}

.hero {
  border: 1px solid var(--line-soft);
  border-radius: 22px;
  padding: 1.2rem;
  background: linear-gradient(145deg, color-mix(in srgb, var(--surface) 84%, transparent), color-mix(in srgb, var(--accent-cyan) 12%, transparent));
}

.kicker {
  margin: 0;
  font-size: 0.74rem;
  letter-spacing: 0.08em;
  color: var(--accent-orange);
}

h1 {
  margin: 0.4rem 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(2rem, 4.5vw, 3.3rem);
}

.hero p {
  margin-bottom: 0;
  color: var(--ink-muted);
  max-width: 68ch;
}

.records {
  display: grid;
  gap: 0.85rem;
}

.record-card {
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
}

.record-card header h2 {
  margin: 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
}

.record-card header p {
  margin: 0.25rem 0 0;
  color: var(--ink-subtle);
}

.record-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.65rem;
  align-items: center;
}

label {
  font-size: 0.76rem;
  color: var(--ink-subtle);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.record-grid p {
  margin: 0.2rem 0 0;
  color: var(--ink);
  font-family: var(--font-mono);
}

.actions {
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

button {
  border: 1px solid var(--line-strong);
  border-radius: 9px;
  min-height: 2rem;
  padding: 0 0.58rem;
  background: color-mix(in srgb, var(--surface) 85%, transparent);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}

button:hover {
  border-color: var(--accent-cyan);
}

footer {
  border-top: 1px dashed var(--line-soft);
  padding-top: 0.65rem;
  display: grid;
  gap: 0.2rem;
}

footer p {
  margin: 0;
  color: var(--ink-muted);
}

@media (max-width: 720px) {
  .record-grid {
    grid-template-columns: 1fr;
  }

  .actions {
    justify-content: flex-start;
  }
}
</style>
