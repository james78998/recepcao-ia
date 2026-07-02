const tenantRepository = require('../repositories/tenantRepository');

function formatTenant(tenant) {
  const { _count, ...rest } = tenant;
  return {
    ...rest,
    totalUsers: _count.users,
    totalLeads: _count.leads,
    totalConversations: _count.conversations,
  };
}

async function list() {
  const tenants = await tenantRepository.findAllForAdmin();
  return tenants.map(formatTenant);
}

async function getById(id) {
  const tenant = await tenantRepository.findByIdForAdmin(id);
  if (!tenant) {
    const err = new Error('Tenant não encontrado.');
    err.status = 404;
    throw err;
  }
  return formatTenant(tenant);
}

module.exports = { list, getById };
