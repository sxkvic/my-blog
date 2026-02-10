import { apiRequest } from './apiClient';

export const VAULT_TOKEN_KEY = 'neon-vault-token';
const AUTH_USER_KEY = 'neon-auth-user';

export interface AuthUser {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

export function getVaultToken() {
  return localStorage.getItem(VAULT_TOKEN_KEY) || '';
}

export function setVaultToken(token: string) {
  localStorage.setItem(VAULT_TOKEN_KEY, token);
}

export function clearVaultToken() {
  localStorage.removeItem(VAULT_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthUser(user: AuthUser) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function loginVault(username: string, password: string) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  return data as { token: string; user: AuthUser };
}

export async function registerVault(username: string, password: string) {
  return (await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })) as { id: number; username: string; role: 'user' };
}

export async function verifyVaultSession(token: string) {
  return (await apiRequest('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })) as AuthUser;
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
