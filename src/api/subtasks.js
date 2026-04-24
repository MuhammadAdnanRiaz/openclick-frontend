import { apiFetch } from './client.js';

export async function create(workspaceId, taskId, title) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/subtasks`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export async function toggle(workspaceId, taskId, subtaskId, done) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ done }),
  });
}

export async function remove(workspaceId, taskId, subtaskId) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: 'DELETE',
  });
}
