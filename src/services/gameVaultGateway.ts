import type { GameVaultItem } from '../data/blog';
import { apiRequest } from './apiClient';
import { getVaultToken } from './vaultAuthGateway';

export type GameDraft = Omit<GameVaultItem, 'id'> & { id?: string };

function authHeaders() {
  const token = getVaultToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listGameAccounts(): Promise<GameVaultItem[]> {
  return (await apiRequest('/game-accounts', {
    headers: authHeaders(),
  })) as GameVaultItem[];
}

export async function createGameAccount(payload: GameDraft): Promise<GameVaultItem> {
  return (await apiRequest('/game-accounts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })) as GameVaultItem;
}

export async function updateGameAccount(id: string, payload: Partial<GameVaultItem>): Promise<GameVaultItem> {
  return (await apiRequest(`/game-accounts/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })) as GameVaultItem;
}

export async function deleteGameAccount(id: string): Promise<void> {
  await apiRequest(`/game-accounts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
