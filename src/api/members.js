import { apiFetch } from './client.js';

export async function list(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/members`);
}

export async function updateRole(workspaceId, memberId, role) {
  return apiFetch(`/workspaces/${workspaceId}/members/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function remove(workspaceId, memberId) {
  return apiFetch(`/workspaces/${workspaceId}/members/${memberId}`, { method: 'DELETE' });
}

export async function leaveWorkspace(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/members/me`, { method: 'DELETE' });
}

export async function invite(workspaceId, email) {
  return apiFetch(`/workspaces/${workspaceId}/invitations`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function listInvitations(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/invitations`);
}

export async function revokeInvitation(workspaceId, email) {
  return apiFetch(`/workspaces/${workspaceId}/invitations/${encodeURIComponent(email)}`, {
    method: 'DELETE',
  });
}
