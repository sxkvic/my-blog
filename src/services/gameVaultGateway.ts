import type { GameVaultItem } from '../data/blog';
import { apiRequest } from './apiClient';

export type GameDraft = Omit<GameVaultItem, 'id'> & { id?: string };

export async function listGameAccounts(): Promise<GameVaultItem[]> {
  return (await apiRequest('/game-accounts')) as GameVaultItem[];
}

export async function createGameAccount(payload: GameDraft): Promise<GameVaultItem> {
  return (await apiRequest('/game-accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as GameVaultItem;
}

export async function updateGameAccount(id: string, payload: Partial<GameVaultItem>): Promise<GameVaultItem> {
  return (await apiRequest(`/game-accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })) as GameVaultItem;
}

export async function deleteGameAccount(id: string): Promise<void> {
  await apiRequest(`/game-accounts/${id}`, {
    method: 'DELETE',
  });
}
