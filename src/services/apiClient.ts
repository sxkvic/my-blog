const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiRequest(path: string, init?: RequestInit) {
  const headers = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}:${text || 'request_failed'}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
