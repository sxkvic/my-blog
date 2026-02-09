import type { MemoTask } from '../data/memo';
import { apiRequest } from './apiClient';
import { getVaultToken } from './vaultAuthGateway';

function authHeaders() {
  const token = getVaultToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type MemoTaskDraft = Omit<MemoTask, 'id' | 'status'>;

export async function listMemoTasks(): Promise<MemoTask[]> {
  return (await apiRequest('/memo-tasks', {
    headers: authHeaders(),
  })) as MemoTask[];
}

export async function createMemoTask(payload: MemoTaskDraft): Promise<MemoTask> {
  return (await apiRequest('/memo-tasks', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...payload, status: 'todo' }),
  })) as MemoTask;
}

export async function updateMemoTask(id: string, payload: Omit<MemoTask, 'id'>): Promise<MemoTask> {
  return (await apiRequest(`/memo-tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })) as MemoTask;
}

export async function setMemoTaskStatus(id: string, status: MemoTask['status']): Promise<MemoTask> {
  return (await apiRequest(`/memo-tasks/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  })) as MemoTask;
}

export async function deleteMemoTask(id: string): Promise<void> {
  await apiRequest(`/memo-tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
