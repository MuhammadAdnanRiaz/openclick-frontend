import { apiFetch } from './client.js';

export async function list(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/spaces`);
}

export async function create(workspaceId, payload) {
  return apiFetch(`/workspaces/${workspaceId}/spaces`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createProject(workspaceId, spaceId, name) {
  return apiFetch(`/workspaces/${workspaceId}/spaces/${spaceId}/projects`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function updateProject(workspaceId, spaceId, projectId, patch) {
  return apiFetch(`/workspaces/${workspaceId}/spaces/${spaceId}/projects/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
