import { apiFetch } from './client.js';

export async function getProfile() {
  return apiFetch('/user/profile');
}

export async function updateProfile(patch) {
  return apiFetch('/user/profile', { method: 'PATCH', body: JSON.stringify(patch) });
}

export async function updateAvatar(avatarColor) {
  return apiFetch('/user/profile/avatar', { method: 'PATCH', body: JSON.stringify({ avatarColor }) });
}

export async function changePassword({ current_password, new_password, confirm_password }) {
  return apiFetch('/user/security/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password, confirm_password }),
  });
}

export async function enable2FA() {
  return apiFetch('/user/security/2fa/enable', { method: 'POST' });
}

export async function verify2FA(code) {
  return apiFetch('/user/security/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function disable2FA(code) {
  return apiFetch('/user/security/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function listSessions() {
  return apiFetch('/user/security/sessions');
}

export async function revokeSession(sessionId) {
  return apiFetch(`/user/security/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function getNotificationPrefs() {
  return apiFetch('/user/notification-preferences');
}

export async function updateNotificationPrefs(prefs) {
  return apiFetch('/user/notification-preferences', { method: 'PATCH', body: JSON.stringify(prefs) });
}

export async function getUIPrefs() {
  return apiFetch('/user/ui-preferences');
}

export async function updateUIPrefs(prefs) {
  return apiFetch('/user/ui-preferences', { method: 'PATCH', body: JSON.stringify(prefs) });
}

export async function deleteAccount() {
  return apiFetch('/user/account', {
    method: 'DELETE',
    body: JSON.stringify({ confirmation: 'delete my account' }),
  });
}
