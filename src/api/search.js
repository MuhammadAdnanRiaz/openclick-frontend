import { apiFetch } from './client.js';

export async function search(workspaceId, q, type = 'all') {
  return apiFetch(`/workspaces/${workspaceId}/search?q=${encodeURIComponent(q)}&type=${type}`);
}
