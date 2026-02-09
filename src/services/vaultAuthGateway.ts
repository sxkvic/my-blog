import { apiRequest } from './apiClient';

export const VAULT_TOKEN_KEY = 'neon-vault-token';

export function getVaultToken() {
  return localStorage.getItem(VAULT_TOKEN_KEY) || '';
}

export function setVaultToken(token: string) {
  localStorage.setItem(VAULT_TOKEN_KEY, token);
}

export function clearVaultToken() {
  localStorage.removeItem(VAULT_TOKEN_KEY);
}

export async function loginVault(username: string, password: string) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  return data as { token: string; username: string };
}

export async function verifyVaultSession(token: string) {
  return apiRequest('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function changeVaultPassword(currentPassword: string, newPassword: string) {
  const token = getVaultToken();
  return apiRequest('/auth/change-password', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
