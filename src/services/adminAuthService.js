import adminApi from './adminApi';

export async function login({ email, password }) {
  const response = await adminApi.post('/admin/auth/login', { email, password });
  return response.data;
}
