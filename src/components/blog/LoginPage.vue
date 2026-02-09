<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import {
  clearVaultToken,
  getVaultToken,
  loginVault,
  registerVault,
  setAuthUser,
  setVaultToken,
  verifyVaultSession,
} from '../../services/vaultAuthGateway';

const props = defineProps<{ siteName: string }>();
const LOGIN_SUCCESS_KEY = 'neo-login-success';

const router = useRouter();
const mode = ref<'login' | 'register'>('login');
const loading = ref(false);
const message = ref('');
const error = ref('');

const loginForm = reactive({
  username: '',
  password: '',
});

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
});

const actionTitle = computed(() => (mode.value === 'login' ? '登录账号' : '创建账号'));
const actionText = computed(() => (mode.value === 'login' ? '登录进入工作区' : '完成注册并登录'));

function switchMode(next: 'login' | 'register') {
  mode.value = next;
  error.value = '';
  message.value = '';
}

async function submitLogin() {
  if (!loginForm.username.trim() || !loginForm.password.trim()) {
    error.value = '请输入用户名和密码';
    return;
  }

  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    const data = await loginVault(loginForm.username.trim(), loginForm.password);
    setVaultToken(data.token);
    setAuthUser(data.user);
    sessionStorage.setItem(LOGIN_SUCCESS_KEY, '1');
    await router.replace('/');
  } catch {
    error.value = '登录失败，请检查账号或密码';
  } finally {
    loading.value = false;
  }
}

async function submitRegister() {
  if (!registerForm.username.trim()) {
    error.value = '请输入用户名';
    return;
  }
  if (registerForm.password.length < 8) {
    error.value = '密码至少 8 位';
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    error.value = '两次输入密码不一致';
    return;
  }

  loading.value = true;
  error.value = '';
  message.value = '';
  try {
    await registerVault(registerForm.username.trim(), registerForm.password);
    message.value = '注册成功，正在为你登录...';
    loginForm.username = registerForm.username.trim();
    loginForm.password = registerForm.password;
    await submitLogin();
  } catch (e) {
    const text = e instanceof Error ? e.message : '';
    if (text.includes('409')) {
      error.value = '用户名已存在，请更换一个';
    } else {
      error.value = '注册失败，请稍后再试';
    }
  } finally {
    loading.value = false;
  }
}

async function quickCheckSession() {
  const token = getVaultToken();
  if (!token) {
    return;
  }

  try {
    const user = await verifyVaultSession(token);
    setAuthUser(user);
    await router.replace('/');
  } catch {
    clearVaultToken();
  }
}

quickCheckSession();
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/login" />

    <main class="access-main">
      <section class="access-shell reveal">
        <aside class="brand-panel">
          <p class="kicker">NEO ACCESS</p>
          <h1>登录与注册中心</h1>
          <p class="lead">
            首页公开浏览，写作台、备忘录、游戏仓需要账号授权。
            普通用户仅访问自己的数据，管理员可审阅全局数据。
          </p>
          <div class="pill-row">
            <span>数据隔离</span>
            <span>角色权限</span>
            <span>JWT 会话</span>
          </div>
          <div class="mesh" />
        </aside>

        <section class="form-panel">
          <div class="tab-switch">
            <button type="button" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</button>
            <button type="button" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</button>
          </div>

          <h2>{{ actionTitle }}</h2>
          <p class="hint">{{ actionText }}</p>

          <form v-if="mode === 'login'" class="form-grid" @submit.prevent="submitLogin">
            <label>
              用户名
              <input v-model="loginForm.username" type="text" placeholder="请输入用户名" autocomplete="username" />
            </label>
            <label>
              密码
              <input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                autocomplete="current-password"
              />
            </label>
            <button class="submit-btn" type="submit" :disabled="loading">
              {{ loading ? '登录中...' : '立即登录' }}
            </button>
          </form>

          <form v-else class="form-grid" @submit.prevent="submitRegister">
            <label>
              用户名
              <input v-model="registerForm.username" type="text" placeholder="设置用户名" autocomplete="username" />
            </label>
            <label>
              密码
              <input
                v-model="registerForm.password"
                type="password"
                placeholder="至少 8 位"
                autocomplete="new-password"
              />
            </label>
            <label>
              确认密码
              <input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="再次输入密码"
                autocomplete="new-password"
              />
            </label>
            <button class="submit-btn" type="submit" :disabled="loading">
              {{ loading ? '提交中...' : '注册并登录' }}
            </button>
          </form>

          <p v-if="message" class="msg ok">{{ message }}</p>
          <p v-if="error" class="msg err">{{ error }}</p>
        </section>
      </section>
    </main>

    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.access-main {
  width: min(1200px, calc(100% - 2rem));
  margin: 1.3rem auto 0;
}

.access-shell {
  border: 1px solid var(--line-soft);
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.brand-panel {
  padding: 1.35rem;
  position: relative;
  background:
    radial-gradient(340px 220px at 8% 8%, color-mix(in srgb, var(--accent-cyan) 28%, transparent), transparent 70%),
    radial-gradient(280px 220px at 92% 102%, color-mix(in srgb, var(--accent-orange) 22%, transparent), transparent 74%),
    linear-gradient(160deg, color-mix(in srgb, var(--surface) 84%, transparent), color-mix(in srgb, var(--panel-ink) 8%, transparent));
}

.kicker {
  margin: 0;
  color: var(--accent-orange);
  letter-spacing: 0.09em;
  font-size: 0.74rem;
}

h1 {
  margin: 0.4rem 0 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(1.7rem, 3.3vw, 2.7rem);
  line-height: 1.04;
}

.lead {
  margin-top: 0.8rem;
  color: var(--ink-muted);
  max-width: 38ch;
}

.pill-row {
  margin-top: 1rem;
  display: flex;
  gap: 0.45rem;
  flex-wrap: wrap;
}

.pill-row span {
  border-radius: 999px;
  border: 1px solid var(--line-soft);
  padding: 0.22rem 0.56rem;
  font-size: 0.82rem;
  color: var(--ink-subtle);
  background: color-mix(in srgb, var(--surface) 78%, transparent);
}

.mesh {
  margin-top: 1.1rem;
  height: 180px;
  border-radius: 16px;
  border: 1px solid var(--line-soft);
  background:
    linear-gradient(120deg, color-mix(in srgb, var(--accent-cyan) 38%, transparent), transparent 62%),
    linear-gradient(320deg, color-mix(in srgb, var(--accent-orange) 30%, transparent), transparent 60%),
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--line-soft) 42%, transparent), color-mix(in srgb, var(--line-soft) 42%, transparent) 1px, transparent 1px, transparent 16px),
    color-mix(in srgb, var(--surface) 86%, transparent);
}

.form-panel {
  padding: 1.35rem;
  display: grid;
  align-content: start;
  gap: 0.65rem;
}

.tab-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
}

button,
input {
  font: inherit;
}

.tab-switch button {
  min-height: 2.2rem;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink);
  cursor: pointer;
}

.tab-switch button.active {
  border: 0;
  color: #01202a;
  background: linear-gradient(125deg, var(--accent-cyan), #57f0ff);
  font-weight: 700;
}

h2 {
  margin: 0.28rem 0 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: 1.5rem;
}

.hint {
  margin: 0;
  color: var(--ink-muted);
}

.form-grid {
  margin-top: 0.2rem;
  display: grid;
  gap: 0.6rem;
}

label {
  display: grid;
  gap: 0.34rem;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

input {
  min-height: 2.35rem;
  border-radius: 10px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--surface) 90%, transparent);
  color: var(--ink-strong);
  padding: 0 0.66rem;
}

.submit-btn {
  min-height: 2.45rem;
  border-radius: 10px;
  border: 0;
  color: #001a22;
  background: linear-gradient(125deg, var(--accent-cyan), #5bf0ff);
  font-weight: 700;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.msg {
  margin: 0;
  border-radius: 10px;
  border: 1px solid var(--line-soft);
  padding: 0.45rem 0.6rem;
  font-size: 0.9rem;
}

.msg.ok {
  color: #1c7648;
  border-color: color-mix(in srgb, #3ace83 60%, var(--line-soft));
  background: color-mix(in srgb, #3ace83 12%, transparent);
}

.msg.err {
  color: #c13a52;
  border-color: color-mix(in srgb, #f1617d 58%, var(--line-soft));
  background: color-mix(in srgb, #f1617d 12%, transparent);
}

.reveal {
  animation: reveal 0.62s ease both;
}

@keyframes reveal {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 980px) {
  .access-shell {
    grid-template-columns: 1fr;
  }
}
</style>
