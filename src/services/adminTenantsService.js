import adminApi from './adminApi';

export async function getTenants() {
  const response = await adminApi.get('/admin/tenants');
  return response.data;
}

export async function getTenantById(id) {
  const response = await adminApi.get(`/admin/tenants/${id}`);
  return response.data;
}

export async function createTenant(data) {
  const response = await adminApi.post('/admin/tenants', data);
  return response.data;
}

export async function getTenantModules(id) {
  const response = await adminApi.get(`/admin/tenants/${id}/modules`);
  return response.data;
}

export async function updateTenantModule(id, moduleKey, enabled) {
  const response = await adminApi.patch(`/admin/tenants/${id}/modules/${moduleKey}`, { enabled });
  return response.data;
}

export async function updateTenantModulesBulk(id, modules) {
  const response = await adminApi.put(`/admin/tenants/${id}/modules`, { modules });
  return response.data;
}
