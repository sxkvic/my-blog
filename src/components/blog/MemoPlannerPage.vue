<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import SiteFooter from './SiteFooter.vue';
import SiteHeader from './SiteHeader.vue';
import { useMemoPlanner } from '../../composables/useMemoPlanner';
import type { MemoTask } from '../../data/memo';

const props = defineProps<{ siteName: string }>();

const { tasks, loadTasks, addMemoTask, updateMemoTask, setMemoTaskStatus, deleteMemoTask } = useMemoPlanner();

const today = new Date();
const selectedDate = ref(today.toISOString().slice(0, 10));
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const filterMode = ref<'all' | 'todo' | 'done'>('all');
const nowLabel = ref('');
const showEditor = ref(false);
const editTargetId = ref('');
const editorTitle = ref('新增待办');
const datePreset = ref<'selected' | 'today' | 'tomorrow' | 'custom'>('selected');

const form = reactive({
  title: '',
  details: '',
  date: selectedDate.value,
  priority: '中' as MemoTask['priority'],
  category: '日常' as MemoTask['category'],
});

const weekNames = ['一', '二', '三', '四', '五', '六', '日'];

const monthTitle = computed(() => {
  const y = currentMonth.value.getFullYear();
  const m = currentMonth.value.getMonth() + 1;
  return `${y} 年 ${m} 月`;
});

const todayTasks = computed(() => {
  return tasks.value
    .filter((task) => task.date === todayString())
    .sort((a, b) => Number(a.status === 'done') - Number(b.status === 'done'));
});

const selectedTasks = computed(() => {
  const list = tasks.value.filter((task) => task.date === selectedDate.value);
  if (filterMode.value === 'all') {
    return list;
  }
  return list.filter((task) => task.status === filterMode.value);
});

const summary = computed(() => {
  const todo = tasks.value.filter((task) => task.status === 'todo').length;
  const done = tasks.value.filter((task) => task.status === 'done').length;
  const urgent = tasks.value.filter((task) => task.priority === '高' && task.status === 'todo').length;
  return { todo, done, urgent };
});

const calendarCells = computed(() => {
  const base = currentMonth.value;
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const startShift = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - startShift);

  const cells: Array<{
    date: string;
    day: number;
    inMonth: boolean;
    isToday: boolean;
    todoCount: number;
    doneCount: number;
  }> = [];

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const iso = toIso(date);
    const dayTasks = tasks.value.filter((task) => task.date === iso);
    cells.push({
      date: iso,
      day: date.getDate(),
      inMonth: date.getMonth() === base.getMonth(),
      isToday: iso === todayString(),
      todoCount: dayTasks.filter((task) => task.status === 'todo').length,
      doneCount: dayTasks.filter((task) => task.status === 'done').length,
    });
  }

  return cells;
});

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function toIso(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function shiftMonth(step: number) {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + step, 1);
}

function jumpToday() {
  const now = new Date();
  currentMonth.value = new Date(now.getFullYear(), now.getMonth(), 1);
  selectedDate.value = todayString();
}

function nextDay(base: string, step: number) {
  const date = new Date(`${base}T00:00:00`);
  date.setDate(date.getDate() + step);
  return toIso(date);
}

function applyDatePreset() {
  if (datePreset.value === 'selected') {
    form.date = selectedDate.value;
    return;
  }
  if (datePreset.value === 'today') {
    form.date = todayString();
    return;
  }
  if (datePreset.value === 'tomorrow') {
    form.date = nextDay(todayString(), 1);
  }
}

function openCreate() {
  editTargetId.value = '';
  editorTitle.value = '新增待办';
  datePreset.value = 'selected';
  form.title = '';
  form.details = '';
  form.date = selectedDate.value;
  form.priority = '中';
  form.category = '日常';
  showEditor.value = true;
}

function openEdit(task: MemoTask) {
  editTargetId.value = task.id;
  editorTitle.value = '编辑待办';
  datePreset.value = 'custom';
  form.title = task.title;
  form.details = task.details;
  form.date = task.date;
  form.priority = task.priority;
  form.category = task.category;
  showEditor.value = true;
}

async function markDone(id: string) {
  const current = tasks.value.find((task) => task.id === id);
  if (!current || current.status === 'done') {
    return;
  }
  try {
    await setMemoTaskStatus(id, 'done');
  } catch {
    window.alert('状态更新失败，请稍后重试');
  }
}

async function revertTodo(id: string) {
  try {
    await setMemoTaskStatus(id, 'todo');
  } catch {
    window.alert('状态更新失败，请稍后重试');
  }
}

async function submitTask() {
  if (!form.title.trim()) {
    window.alert('请先输入待办标题');
    return;
  }

  const payload = {
    title: form.title.trim(),
    details: form.details.trim() || '暂无备注',
    date: form.date,
    priority: form.priority,
    category: form.category,
  };

  try {
    if (!editTargetId.value) {
      await addMemoTask(payload);
    } else {
      const old = tasks.value.find((task) => task.id === editTargetId.value);
      await updateMemoTask(editTargetId.value, {
        ...payload,
        status: old?.status ?? 'todo',
      });
    }
    showEditor.value = false;
  } catch {
    window.alert('保存失败，请检查后端服务是否已启动');
  }
}

async function removeTask(id: string) {
  const ok = window.confirm('确认删除这条待办吗？');
  if (!ok) {
    return;
  }
  try {
    await deleteMemoTask(id);
  } catch {
    window.alert('删除失败，请稍后重试');
  }
}

let timer = 0;

function refreshClock() {
  const now = new Date();
  nowLabel.value = `${now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} ${now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
}

onMounted(async () => {
  try {
    await loadTasks();
  } catch {
    window.alert('待办加载失败，请确认后端 API 可用');
  }
  refreshClock();
  timer = window.setInterval(refreshClock, 30000);
});

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});
</script>

<template>
  <div>
    <SiteHeader :site-name="siteName" active-path="/memo" />

    <main class="memo-main">
      <section class="hero reveal">
        <p class="kicker">MEMO OS</p>
        <h1>备忘录 · 待办中枢</h1>
        <p class="clock">{{ nowLabel }}</p>
        <div class="hero-stats">
          <p>待完成 {{ summary.todo }}</p>
          <p>已完成 {{ summary.done }}</p>
          <p>高优先级 {{ summary.urgent }}</p>
          <button type="button" class="add-btn" @click="openCreate">新增待办</button>
        </div>
      </section>

      <section class="memo-layout reveal delay-1">
        <article class="calendar-card">
          <header class="calendar-head">
            <h2>{{ monthTitle }}</h2>
            <div class="calendar-actions">
              <button type="button" @click="shiftMonth(-1)">上个月</button>
              <button type="button" @click="jumpToday">今天</button>
              <button type="button" @click="shiftMonth(1)">下个月</button>
            </div>
          </header>

          <div class="week-row">
            <span v-for="name in weekNames" :key="name">{{ name }}</span>
          </div>

          <div class="calendar-grid">
            <button
              v-for="cell in calendarCells"
              :key="cell.date"
              type="button"
              :class="[
                'day-cell',
                { muted: !cell.inMonth, today: cell.isToday, selected: selectedDate === cell.date },
              ]"
              @click="selectedDate = cell.date"
            >
              <span class="day-num">{{ cell.day }}</span>
              <span v-if="cell.todoCount || cell.doneCount" class="day-markers">
                <i v-if="cell.todoCount" class="todo-dot">{{ cell.todoCount }}</i>
                <i v-if="cell.doneCount" class="done-dot">{{ cell.doneCount }}</i>
              </span>
            </button>
          </div>
        </article>

        <aside class="today-card">
          <header>
            <h2>今日待办</h2>
            <p>{{ todayString() }}</p>
          </header>
          <div class="today-list">
            <article v-for="task in todayTasks" :key="task.id" :class="['today-item', { done: task.status === 'done' }]">
              <button
                v-if="task.status === 'todo'"
                type="button"
                class="check"
                @click="markDone(task.id)"
              >
                完成
              </button>
              <button v-else type="button" class="check done-check" @click="revertTodo(task.id)">已完成</button>
              <div>
                <p class="task-title">{{ task.title }}</p>
                <p class="task-detail">{{ task.details }}</p>
                <p class="status-line">
                  <span :class="['status-badge', task.status === 'done' ? 'done' : 'todo']">
                    {{ task.status === 'done' ? '完成状态' : '待办状态' }}
                  </span>
                </p>
              </div>
            </article>
            <p v-if="!todayTasks.length" class="empty">今天没有待办，适合开始一个新目标。</p>
          </div>
        </aside>
      </section>

      <section class="list-card reveal delay-2">
        <header class="list-head">
          <h2>{{ selectedDate }} 的任务</h2>
          <div class="filters">
            <button type="button" :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">全部</button>
            <button type="button" :class="{ active: filterMode === 'todo' }" @click="filterMode = 'todo'">待完成</button>
            <button type="button" :class="{ active: filterMode === 'done' }" @click="filterMode = 'done'">已完成</button>
          </div>
        </header>

        <div class="task-list">
          <article v-for="task in selectedTasks" :key="task.id" :class="['task-row', { done: task.status === 'done' }]">
            <button
              v-if="task.status === 'todo'"
              type="button"
              class="check"
              @click="markDone(task.id)"
            >
              完成
            </button>
            <button v-else type="button" class="check done-check" @click="revertTodo(task.id)">已完成</button>
            <div class="task-main">
              <p class="task-title">{{ task.title }}</p>
              <p class="task-detail">{{ task.details }}</p>
              <div class="task-meta">
                <span :class="['status-badge', task.status === 'done' ? 'done' : 'todo']">
                  {{ task.status === 'done' ? '完成状态' : '待办状态' }}
                </span>
                <span>{{ task.category }}</span>
                <span :class="['priority', task.priority === '高' ? 'high' : task.priority === '中' ? 'mid' : 'low']">{{ task.priority }}优先</span>
              </div>
            </div>
            <div class="task-actions">
              <button type="button" @click="openEdit(task)">编辑</button>
              <button type="button" class="danger" @click="removeTask(task.id)">删除</button>
            </div>
          </article>
          <p v-if="!selectedTasks.length" class="empty">当前日期没有任务，点击“新增待办”开始记录。</p>
        </div>
      </section>
    </main>

    <div v-if="showEditor" class="modal-backdrop" @click.self="showEditor = false">
      <section class="modal">
        <h2>{{ editorTitle }}</h2>
        <div class="form-grid">
          <label>
            标题
            <input v-model.trim="form.title" type="text" placeholder="例如：写周记首稿" />
          </label>
          <label>
            日期快捷选择
            <select v-model="datePreset" @change="applyDatePreset">
              <option value="selected">跟随当前选中日期</option>
              <option value="today">今天</option>
              <option value="tomorrow">明天</option>
              <option value="custom">自定义日期</option>
            </select>
          </label>
          <label>
            指定日期
            <input v-model="form.date" type="date" :disabled="datePreset !== 'custom'" />
          </label>
          <label>
            分类
            <select v-model="form.category">
              <option value="日常">日常</option>
              <option value="技术">技术</option>
              <option value="内容">内容</option>
              <option value="游戏">游戏</option>
            </select>
          </label>
          <label>
            优先级
            <select v-model="form.priority">
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </label>
          <label class="full">
            备注
            <textarea v-model.trim="form.details" rows="4" placeholder="补充执行细节、目标和截止提醒"></textarea>
          </label>
        </div>
        <div class="modal-actions">
          <button type="button" @click="showEditor = false">取消</button>
          <button type="button" class="add-btn" @click="submitTask">保存</button>
        </div>
      </section>
    </div>

    <SiteFooter :site-name="siteName" />
  </div>
</template>

<style scoped>
.memo-main {
  width: min(1240px, calc(100% - 2rem));
  margin: 1.35rem auto 0;
  display: grid;
  gap: 1rem;
}

.hero,
.calendar-card,
.today-card,
.list-card {
  border: 1px solid var(--line-soft);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}

.hero {
  padding: 1.1rem;
  background:
    radial-gradient(220px 160px at 92% -8%, color-mix(in srgb, var(--accent-orange) 26%, transparent), transparent 70%),
    linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--accent-cyan) 13%, transparent));
}

.kicker {
  margin: 0;
  color: var(--accent-orange);
  letter-spacing: 0.08em;
  font-size: 0.73rem;
}

h1 {
  margin: 0.35rem 0 0;
  font-family: var(--font-display);
  color: var(--ink-strong);
  font-size: clamp(1.66rem, 3vw, 2.3rem);
}

.clock {
  margin-top: 0.4rem;
  color: var(--ink-muted);
}

.hero-stats {
  margin-top: 0.78rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.hero-stats p {
  margin: 0;
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  padding: 0.26rem 0.58rem;
  color: var(--ink-subtle);
}

.memo-layout {
  display: grid;
  grid-template-columns: 1.28fr 0.72fr;
  gap: 0.8rem;
}

.calendar-card,
.today-card,
.list-card {
  padding: 0.82rem;
}

.calendar-head,
.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.calendar-head h2,
.today-card h2,
.list-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.34rem;
  color: var(--ink-strong);
}

.calendar-actions,
.filters {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.week-row {
  margin-top: 0.66rem;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.36rem;
}

.week-row span {
  text-align: center;
  font-size: 0.79rem;
  color: var(--ink-subtle);
}

.calendar-grid {
  margin-top: 0.35rem;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.36rem;
}

.day-cell {
  min-height: 4.65rem;
  border-radius: 12px;
  border: 1px solid var(--line-soft);
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  padding: 0.42rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
}

.day-cell:hover,
.day-cell.selected {
  border-color: color-mix(in srgb, var(--accent-cyan) 70%, var(--line-soft));
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--accent-cyan) 26%, transparent);
}

.day-cell.today {
  background: color-mix(in srgb, var(--accent-cyan) 11%, var(--surface));
}

.day-cell.muted {
  opacity: 0.5;
}

.day-num {
  font-family: var(--font-mono);
  font-size: 0.87rem;
  color: var(--ink-strong);
}

.day-markers {
  display: inline-flex;
  gap: 0.2rem;
}

.day-markers i {
  font-style: normal;
  min-width: 1.12rem;
  height: 1.12rem;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  font-size: 0.68rem;
}

.todo-dot {
  color: #052430;
  background: color-mix(in srgb, var(--accent-cyan) 78%, white 12%);
}

.done-dot {
  color: #e8f2ff;
  background: color-mix(in srgb, #1a2f44 84%, white 6%);
}

.today-card header p {
  margin-top: 0.25rem;
  color: var(--ink-muted);
}

.today-list,
.task-list {
  margin-top: 0.62rem;
  display: grid;
  gap: 0.54rem;
}

.today-item,
.task-row {
  border: 1px solid var(--line-soft);
  border-radius: 12px;
  padding: 0.55rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.52rem;
  align-items: start;
}

.today-item {
  grid-template-columns: auto 1fr;
}

.today-item.done,
.task-row.done {
  opacity: 0.72;
  border-color: color-mix(in srgb, #44d88a 52%, var(--line-soft));
  background: color-mix(in srgb, #44d88a 9%, var(--surface));
}

.today-item.done .task-title,
.task-row.done .task-title {
  text-decoration: line-through;
  text-decoration-thickness: 1.8px;
  text-decoration-color: color-mix(in srgb, var(--ink-muted) 78%, transparent);
}

.today-item.done .task-detail,
.task-row.done .task-detail {
  text-decoration: line-through;
  text-decoration-color: color-mix(in srgb, var(--ink-subtle) 70%, transparent);
}

.task-main {
  display: grid;
  gap: 0.34rem;
}

.task-title {
  margin: 0;
  font-weight: 700;
  color: var(--ink-strong);
}

.task-detail {
  margin: 0;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.task-meta {
  display: flex;
  gap: 0.33rem;
  flex-wrap: wrap;
}

.task-meta span {
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  padding: 0.14rem 0.42rem;
  font-size: 0.74rem;
  color: var(--ink-subtle);
}

.status-line {
  margin: 0.35rem 0 0;
}

.status-badge {
  border: 1px solid var(--line-soft);
  border-radius: 999px;
  padding: 0.12rem 0.42rem;
  font-size: 0.73rem;
}

.status-badge.todo {
  color: #0b5f7f;
  border-color: color-mix(in srgb, #3bc2ff 62%, var(--line-soft));
  background: color-mix(in srgb, #3bc2ff 12%, transparent);
}

.status-badge.done {
  color: #1f7b4a;
  border-color: color-mix(in srgb, #47db8a 64%, var(--line-soft));
  background: color-mix(in srgb, #47db8a 14%, transparent);
}

.priority.high {
  color: #a52b3d;
  border-color: color-mix(in srgb, #ef5e75 65%, var(--line-soft));
}

.priority.mid {
  color: #87520c;
  border-color: color-mix(in srgb, #ffa840 60%, var(--line-soft));
}

.priority.low {
  color: #24517b;
  border-color: color-mix(in srgb, #66b9ff 60%, var(--line-soft));
}

.task-actions {
  display: flex;
  gap: 0.36rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

input,
textarea,
select,
button {
  font: inherit;
}

button,
input,
textarea,
select {
  min-height: 2.08rem;
  border-radius: 9px;
  border: 1px solid var(--line-strong);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  color: var(--ink);
  padding: 0 0.6rem;
}

textarea {
  min-height: 7.2rem;
  padding: 0.56rem 0.6rem;
}

button {
  cursor: pointer;
}

button:hover {
  border-color: var(--accent-cyan);
}

.check {
  min-width: 3.7rem;
}

.done-check {
  color: #1f7b4a;
  border-color: color-mix(in srgb, #47db8a 64%, var(--line-soft));
  background: color-mix(in srgb, #47db8a 14%, transparent);
}

:global(:root[data-theme='neon-dark']) .today-item.done,
:global(:root[data-theme='neon-dark']) .task-row.done {
  opacity: 0.96;
  border-color: #46c8ff;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, #46c8ff 20%, var(--surface)),
    color-mix(in srgb, #0a1828 86%, var(--surface))
  );
}

:global(:root[data-theme='neon-dark']) .today-item.done .task-title,
:global(:root[data-theme='neon-dark']) .task-row.done .task-title {
  color: #e8f7ff;
  text-decoration-color: #72d6ff;
}

:global(:root[data-theme='neon-dark']) .today-item.done .task-detail,
:global(:root[data-theme='neon-dark']) .task-row.done .task-detail {
  color: #b6d6ea;
  text-decoration-color: #4b8fb2;
}

:global(:root[data-theme='neon-dark']) .status-badge.todo {
  color: #ffeecf;
  border-color: #ffb547;
  background: color-mix(in srgb, #ffb547 30%, transparent);
}

:global(:root[data-theme='neon-dark']) .status-badge.done {
  color: #eaf7ff;
  border-color: #39beff;
  background: color-mix(in srgb, #39beff 32%, transparent);
}

:global(:root[data-theme='neon-dark']) .check {
  border-color: #7f5d2a;
  color: #ffe6bd;
  background: color-mix(in srgb, #2b1d0b 82%, var(--surface));
}

:global(:root[data-theme='neon-dark']) .check:hover {
  border-color: #ffb547;
  box-shadow: 0 0 0 1px color-mix(in srgb, #ffb547 30%, transparent);
}

:global(:root[data-theme='neon-dark']) .done-check {
  color: #eaf7ff;
  border-color: #39beff;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #39beff 42%, #0b2033 58%),
    color-mix(in srgb, #67d0ff 34%, #0b2033 66%)
  );
}

:global(:root[data-theme='neon-dark']) .task-meta .priority.high {
  color: #ffd8dc;
  border-color: #ff6a7f;
  background: color-mix(in srgb, #ff6a7f 22%, transparent);
}

:global(:root[data-theme='neon-dark']) .task-meta .priority.mid {
  color: #ffeac9;
  border-color: #ffb547;
  background: color-mix(in srgb, #ffb547 22%, transparent);
}

:global(:root[data-theme='neon-dark']) .task-meta .priority.low {
  color: #d6f0ff;
  border-color: #5ecbff;
  background: color-mix(in srgb, #5ecbff 20%, transparent);
}

.add-btn {
  border: 0;
  color: #05222d;
  background: linear-gradient(125deg, var(--accent-cyan), #59efff);
  font-weight: 700;
}

.filters button.active {
  border-color: color-mix(in srgb, var(--accent-cyan) 65%, var(--line-soft));
  background: color-mix(in srgb, var(--accent-cyan) 13%, var(--surface));
}

.empty {
  margin: 0;
  color: var(--ink-subtle);
  padding: 0.4rem;
}

.danger {
  color: #b12e3f;
  border-color: color-mix(in srgb, #f6607f 60%, var(--line-soft));
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: color-mix(in srgb, #06131c 70%, transparent);
  display: grid;
  place-items: center;
  z-index: 120;
}

.modal {
  width: min(720px, calc(100% - 2rem));
  border-radius: 14px;
  border: 1px solid var(--line-soft);
  background: var(--surface);
  padding: 0.95rem;
  display: grid;
  gap: 0.72rem;
}

.modal h2 {
  margin: 0;
  font-family: var(--font-display);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.55rem;
}

.form-grid label {
  display: grid;
  gap: 0.32rem;
  color: var(--ink-muted);
  font-size: 0.9rem;
}

.form-grid .full {
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1040px) {
  .memo-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 880px) {
  .today-item,
  .task-row {
    grid-template-columns: 1fr;
  }

  .task-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .day-cell {
    min-height: 3.8rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
