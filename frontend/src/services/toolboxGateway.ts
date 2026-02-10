import type { ToolLinkItem } from '../data/tools';
import { apiRequest } from './apiClient';
import { getVaultToken } from './vaultAuthGateway';

export type ToolDraft = Omit<ToolLinkItem, 'id'> & { id?: string };

function authHeaders() {
  const token = getVaultToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listToolLinks(): Promise<ToolLinkItem[]> {
  return (await apiRequest('/tools', {
    headers: authHeaders(),
  })) as ToolLinkItem[];
}

export async function createToolLink(payload: ToolDraft): Promise<ToolLinkItem> {
  return (await apiRequest('/tools', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })) as ToolLinkItem;
}

export async function updateToolLink(id: string, payload: Partial<ToolLinkItem>): Promise<ToolLinkItem> {
  return (await apiRequest(`/tools/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })) as ToolLinkItem;
}

export async function deleteToolLink(id: string): Promise<void> {
  await apiRequest(`/tools/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
