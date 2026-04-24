import { apiFetch } from './client.js';

export async function list(workspaceId, { filter = 'all', page = 1, limit = 30 } = {}) {
  return apiFetch(`/workspaces/${workspaceId}/activity?filter=${filter}&page=${page}&limit=${limit}`);
}
