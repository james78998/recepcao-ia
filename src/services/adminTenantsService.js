import adminApi from './adminApi';

export async function getTenants() {
  const response = await adminApi.get('/admin/tenants');
  return response.data;
}

export async function getTenantById(id) {
  const response = await adminApi.get(`/admin/tenants/${id}`);
  return response.data;
}
