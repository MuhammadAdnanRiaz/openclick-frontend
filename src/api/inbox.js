import { apiFetch } from './client.js';

export async function list({ tab = 'all', page = 1, limit = 50 } = {}) {
  return apiFetch(`/user/inbox?tab=${tab}&page=${page}&limit=${limit}`);
}

export async function markRead(itemId) {
  return apiFetch(`/user/inbox/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ unread: false }),
  });
}

export async function markAllRead() {
  return apiFetch('/user/inbox/mark-all-read', { method: 'PATCH' });
}
