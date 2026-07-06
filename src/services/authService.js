import api from './api';

export async function login({ email, password }) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

export async function register({ tenantName, tenantEmail, userName, userEmail, password }) {
  const response = await api.post('/auth/register', {
    tenantName,
    tenantEmail,
    userName,
    userEmail,
    password,
  });
  return response.data;
}

export async function refresh() {
  const response = await api.post('/auth/refresh');
  return response.data;
}

export async function me() {
  const response = await api.get('/auth/me');
  return response.data;
}

export async function updateMe(data) {
  const response = await api.patch('/auth/me', data);
  return response.data;
}

export async function changePassword(data) {
  const response = await api.post('/auth/change-password', data);
  return response.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function forgotPassword(email) {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
}

export async function resetPassword({ token, newPassword }) {
  const response = await api.post('/auth/reset-password', { token, newPassword });
  return response.data;
}
