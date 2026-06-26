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

export async function logout() {
  await api.post('/auth/logout');
}
