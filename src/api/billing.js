import { apiFetch } from './client.js';

export async function getSubscription(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/billing/subscription`);
}

export async function upgrade(workspaceId, { plan, cycle }) {
  return apiFetch(`/workspaces/${workspaceId}/billing/upgrade`, {
    method: 'POST',
    body: JSON.stringify({ plan, cycle }),
  });
}

export async function cancel(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/billing/cancel`, { method: 'POST' });
}

export async function getInvoices(workspaceId, { page = 1, limit = 12 } = {}) {
  return apiFetch(`/workspaces/${workspaceId}/billing/invoices?page=${page}&limit=${limit}`);
}

export async function getPaymentMethod(workspaceId) {
  return apiFetch(`/workspaces/${workspaceId}/billing/payment-method`);
}

export async function updatePaymentMethod(workspaceId, paymentMethodId) {
  return apiFetch(`/workspaces/${workspaceId}/billing/payment-method`, {
    method: 'PUT',
    body: JSON.stringify({ paymentMethodId }),
  });
}
