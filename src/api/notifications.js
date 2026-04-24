import { apiFetch } from './client.js';

export async function list({ page = 1, limit = 50 } = {}) {
  return apiFetch(`/user/notifications?page=${page}&limit=${limit}`);
}

export async function dismiss(notificationId) {
  return apiFetch(`/user/notifications/${notificationId}`, { method: 'DELETE' });
}

export async function clearAll() {
  return apiFetch('/user/notifications', { method: 'DELETE' });
}

export async function markAllRead() {
  return apiFetch('/user/notifications/mark-all-read', { method: 'PATCH' });
}
