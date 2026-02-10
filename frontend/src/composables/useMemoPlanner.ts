import { ref } from 'vue';
import type { MemoTask } from '../data/memo';
import {
  createMemoTask as createMemoTaskApi,
  deleteMemoTask as deleteMemoTaskApi,
  listMemoTasks as listMemoTasksApi,
  setMemoTaskStatus as setMemoTaskStatusApi,
  updateMemoTask as updateMemoTaskApi,
} from '../services/memoGateway';

const tasks = ref<MemoTask[]>([]);
const initialized = ref(false);

async function loadTasks(force = false) {
  if (initialized.value && !force) {
    return;
  }

  tasks.value = await listMemoTasksApi();
  initialized.value = true;
}

async function addMemoTask(payload: Omit<MemoTask, 'id' | 'status'>) {
  const created = await createMemoTaskApi(payload);
  tasks.value = [created, ...tasks.value.filter((task) => task.id !== created.id)];
  return created;
}

async function updateMemoTask(id: string, payload: Omit<MemoTask, 'id'>) {
  const updated = await updateMemoTaskApi(id, payload);
  tasks.value = tasks.value.map((task) => (task.id === id ? updated : task));
  return updated;
}

async function setMemoTaskStatus(id: string, status: MemoTask['status']) {
  const updated = await setMemoTaskStatusApi(id, status);
  tasks.value = tasks.value.map((task) => (task.id === id ? updated : task));
  return updated;
}

async function deleteMemoTask(id: string) {
  await deleteMemoTaskApi(id);
  tasks.value = tasks.value.filter((task) => task.id !== id);
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
