import { apiFetch, setAuthData } from './client.js';

export async function login({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuthData(data);
  return data;
}

export async function signup({ name, email, password }) {
  const data = await apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  setAuthData(data);
  return data;
}

export async function oauth({ provider, code }) {
  const data = await apiFetch('/auth/oauth', {
    method: 'POST',
    body: JSON.stringify({ provider, code }),
  });
  setAuthData(data);
  return data;
}

export async function refreshToken(refresh_token) {
  return apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token }),
  });
}

export async function forgotPassword({ email }) {
  return apiFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ token, new_password }) {
  return apiFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password }),
  });
}

export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}
