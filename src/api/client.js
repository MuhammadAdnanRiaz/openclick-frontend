const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const KEYS = {
  ACCESS_TOKEN:  'oc_access_token',
  REFRESH_TOKEN: 'oc_refresh_token',
  USER:          'oc_user',
  WORKSPACE_ID:  'oc_workspace_id',
};

export function getToken()        { return localStorage.getItem(KEYS.ACCESS_TOKEN); }
export function getRefreshToken() { return localStorage.getItem(KEYS.REFRESH_TOKEN); }

export function setTokens({ access_token, refresh_token }) {
  if (access_token)  localStorage.setItem(KEYS.ACCESS_TOKEN,  access_token);
  if (refresh_token) localStorage.setItem(KEYS.REFRESH_TOKEN, refresh_token);
}

export function setAuthData({ user, workspace, access_token, refresh_token }) {
  setTokens({ access_token, refresh_token });
  if (user)           localStorage.setItem(KEYS.USER,         JSON.stringify(user));
  if (workspace?.id)  localStorage.setItem(KEYS.WORKSPACE_ID, workspace.id);
}

export function clearAuth() {
  [KEYS.ACCESS_TOKEN, KEYS.REFRESH_TOKEN, KEYS.USER, KEYS.WORKSPACE_ID].forEach(k =>
    localStorage.removeItem(k)
  );
}

export function getStoredAuth() {
  const token       = localStorage.getItem(KEYS.ACCESS_TOKEN);
  const user        = JSON.parse(localStorage.getItem(KEYS.USER) || 'null');
  const workspaceId = localStorage.getItem(KEYS.WORKSPACE_ID);
  if (token && user) return { user, workspaceId };
  return null;
}

let _refreshPromise = null;
let _onUnauthorized  = null;

export function setUnauthorizedHandler(fn) { _onUnauthorized = fn; }

async function attemptRefresh() {
  const rt = getRefreshToken();
  if (!rt) throw new Error('no refresh token');
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });
  if (!res.ok) { clearAuth(); throw new Error('refresh failed'); }
  const data = await res.json();
  setTokens(data);
  return data.access_token;
}

export async function apiFetch(path, options = {}) {
  const makeHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: makeHeaders(getToken()),
  });

  if (res.status === 401) {
    try {
      if (!_refreshPromise) {
        _refreshPromise = attemptRefresh().finally(() => { _refreshPromise = null; });
      }
      const newToken = await _refreshPromise;
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: makeHeaders(newToken),
      });
    } catch {
      clearAuth();
      _onUnauthorized?.();
      throw Object.assign(new Error('Session expired'), { code: 'SESSION_EXPIRED', status: 401 });
    }
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
    err.code   = data?.error?.code;
    err.status = res.status;
    err.field  = data?.error?.field;
    throw err;
  }
  return data;
}
