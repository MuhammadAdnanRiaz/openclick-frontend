import { apiFetch } from './client.js';

export async function list(workspaceId, params = {}) {
  const qs = new URLSearchParams();
  if (params.assignee)  params.assignee.forEach(v  => qs.append('filter[assignee]', v));
  if (params.priority)  params.priority.forEach(v  => qs.append('filter[priority]', v));
  if (params.tags)      params.tags.forEach(v      => qs.append('filter[tags]', v));
  if (params.status)    params.status.forEach(v    => qs.append('filter[status]', v));
  if (params.sort)      qs.set('sort',  params.sort);
  if (params.page)      qs.set('page',  params.page);
  if (params.limit)     qs.set('limit', params.limit);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch(`/workspaces/${workspaceId}/tasks${query}`);
}

export async function get(workspaceId, taskId) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}`);
}

export async function create(workspaceId, payload) {
  return apiFetch(`/workspaces/${workspaceId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function update(workspaceId, taskId, patch) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}

export async function remove(workspaceId, taskId) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}`, { method: 'DELETE' });
}

export async function createBranch(workspaceId, taskId, { repoProvider, repoFullName, sourceBranch }) {
  return apiFetch(`/workspaces/${workspaceId}/tasks/${taskId}/branch`, {
    method: 'POST',
    body: JSON.stringify({ repoProvider, repoFullName, sourceBranch }),
  });
}
