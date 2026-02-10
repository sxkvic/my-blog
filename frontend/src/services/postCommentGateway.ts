import { apiRequest } from './apiClient';
import { getVaultToken } from './vaultAuthGateway';

export interface PostComment {
  id: string;
  postSlug: string;
  content: string;
  ownerUserId?: number;
  username: string;
  createdAt: string;
}

function authHeaders() {
  const token = getVaultToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listPostComments(slug: string): Promise<PostComment[]> {
  return (await apiRequest(`/posts/${slug}/comments`)) as PostComment[];
}

export async function createPostComment(slug: string, content: string): Promise<PostComment> {
  return (await apiRequest(`/posts/${slug}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  })) as PostComment;
}

export async function deletePostComment(slug: string, commentId: string): Promise<void> {
  await apiRequest(`/posts/${slug}/comments/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
