import { apiFetch } from './client.js';

export async function get(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}`);
}

export async function update(workspaceId, patch) {
  return apiFetch(`/workspaces/${workspaceId}`, { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function create(payload) {
  return apiFetch('/workspaces', { method: 'POST', body: JSON.stringify(payload) });
}
