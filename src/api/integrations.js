import { apiFetch } from './client.js';

export async function list(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/integrations`);
}

export async function connect(workspaceId, provider) {
  return apiFetch(`/workspaces/${workspaceId}/integrations/${provider}/connect`, { method: 'POST' });
}

export async function disconnect(workspaceId, provider) {
  return apiFetch(`/workspaces/${workspaceId}/integrations/${provider}`, { method: 'DELETE' });
}

export async function listWebhooks(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/integrations/webhooks`);
}

export async function createWebhook(workspaceId, payload) {
  return apiFetch(`/workspaces/${workspaceId}/integrations/webhooks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteWebhook(workspaceId, webhookId) {
  return apiFetch(`/workspaces/${workspaceId}/integrations/webhooks/${webhookId}`, {
    method: 'DELETE',
  });
}
