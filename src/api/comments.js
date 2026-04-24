import { apiFetch } from './client.js';

export async function list(workspaceId, taskId) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/comments`);
}

export async function create(workspaceId, taskId, body) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

export async function remove(workspaceId, taskId, commentId) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}
