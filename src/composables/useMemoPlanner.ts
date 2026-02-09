import { ref } from 'vue';
import { memoSeedTasks, type MemoTask } from '../data/memo';

const MEMO_KEY = 'neo-memo-tasks';
const tasks = ref<MemoTask[]>([]);
const initialized = ref(false);

function cloneSeed() {
  return memoSeedTasks.map((task) => ({ ...task }));
}

function loadTasks() {
  if (initialized.value) {
    return;
  }

  try {
    const raw = localStorage.getItem(MEMO_KEY);
    if (!raw) {
      tasks.value = cloneSeed();
      localStorage.setItem(MEMO_KEY, JSON.stringify(tasks.value));
      initialized.value = true;
      return;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      tasks.value = cloneSeed();
    } else {
      tasks.value = parsed.filter((item) => item && typeof item === 'object') as MemoTask[];
    }
  } catch {
    tasks.value = cloneSeed();
  }

  initialized.value = true;
}

function persist() {
  localStorage.setItem(MEMO_KEY, JSON.stringify(tasks.value));
}

function addMemoTask(payload: Omit<MemoTask, 'id' | 'status'>) {
  const created: MemoTask = {
    id: `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    ...payload,
    // New tasks always start in todo state.
    status: 'todo',
  };
  tasks.value = [created, ...tasks.value];
  persist();
  return created;
}

function updateMemoTask(id: string, payload: Omit<MemoTask, 'id'>) {
  tasks.value = tasks.value.map((task) => (task.id === id ? { id, ...payload } : task));
  persist();
}

function setMemoTaskStatus(id: string, status: MemoTask['status']) {
  tasks.value = tasks.value.map((task) => {
    if (task.id !== id) {
      return task;
    }
    return {
      ...task,
      status,
    };
  });
  persist();
}

function deleteMemoTask(id: string) {
  tasks.value = tasks.value.filter((task) => task.id !== id);
  persist();
}

export function useMemoPlanner() {
  return {
    tasks,
    loadTasks,
    addMemoTask,
    updateMemoTask,
    setMemoTaskStatus,
    deleteMemoTask,
  };
}
