import type { BlogPost, Channel, PostMedia } from '../data/blog';
import { apiRequest } from './apiClient';
import { getVaultToken } from './vaultAuthGateway';

export interface PostDraft {
  title: string;
  excerpt: string;
  channel: Channel;
  category: string;
  tags: string[];
  authorId: string;
  publishedAt: string;
  readTime: string;
  content: string[];
  media: PostMedia[];
}

function authHeaders() {
  const token = getVaultToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listUserPosts(): Promise<BlogPost[]> {
  return (await apiRequest('/posts')) as BlogPost[];
}

export async function createUserPost(draft: PostDraft): Promise<BlogPost> {
  return (await apiRequest('/posts', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(draft),
  })) as BlogPost;
}

export async function updateUserPost(slug: string, payload: Partial<BlogPost>): Promise<BlogPost> {
  return (await apiRequest(`/posts/${slug}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  })) as BlogPost;
}

export async function deleteUserPost(slug: string): Promise<void> {
  await apiRequest(`/posts/${slug}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
