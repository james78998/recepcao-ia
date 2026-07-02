import api from './api';

export async function getMySettings() {
  const response = await api.get('/tenants/me');
  return response.data;
}

export async function updateProfile(data) {
  const response = await api.patch('/tenants/me', data);
  return response.data;
}

export async function updateAiConfig(data) {
  const response = await api.patch('/tenants/me/ai-config', data);
  return response.data;
}

export async function updateWhatsappConfig(data) {
  const response = await api.patch('/tenants/me/whatsapp-config', data);
  return response.data;
}

export async function updateSchedule(data) {
  const response = await api.patch('/tenants/me/schedule', data);
  return response.data;
}

export async function updateBusinessHours(days) {
  const response = await api.patch('/tenants/me/business-hours', { days });
  return response.data;
}

export async function upsertIntegration(provider, data) {
  const response = await api.patch(`/tenants/me/integrations/${provider}`, data);
  return response.data;
}

export async function removeIntegration(provider) {
  const response = await api.delete(`/tenants/me/integrations/${provider}`);
  return response.data;
}
