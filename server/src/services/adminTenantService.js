const tenantRepository = require('../repositories/tenantRepository');
const tenantOnboardingService = require('./tenantOnboardingService');

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

async function create({ tenantName, tenantEmail, userName, userEmail, password }) {
  const { tenant } = await tenantOnboardingService.onboardTenant({
    tenantName,
    tenantEmail,
    userName,
    userEmail,
    password,
  });

  return getById(tenant.id);
}

module.exports = { list, getById, create };
