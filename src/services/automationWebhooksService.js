import api from "./api";

export async function listWebhooks() {
  const response = await api.get("/tenants/me/automations/webhooks");
  return response.data;
}

export async function createWebhook(data) {
  const response = await api.post("/tenants/me/automations/webhooks", data);
  return response.data;
}

export async function updateWebhook(id, data) {
  const response = await api.put(`/tenants/me/automations/webhooks/${id}`, data);
  return response.data;
}

export async function removeWebhook(id) {
  const response = await api.delete(`/tenants/me/automations/webhooks/${id}`);
  return response.data;
}

export async function regenerateSecret(id) {
  const response = await api.post(`/tenants/me/automations/webhooks/${id}/regenerate-secret`);
  return response.data;
}

export async function testWebhook(id) {
  const response = await api.post(`/tenants/me/automations/webhooks/${id}/test`);
  return response.data;
}

export async function getWebhookLogs(id, { page, perPage, filter } = {}) {
  const params = { page, perPage };
  if (filter === "success") params.success = "true";
  if (filter === "failure") params.success = "false";

  const response = await api.get(`/tenants/me/automations/webhooks/${id}/logs`, { params });
  return response.data;
}

export async function getStats() {
  const response = await api.get("/tenants/me/automations/webhooks/stats");
  return response.data;
}
