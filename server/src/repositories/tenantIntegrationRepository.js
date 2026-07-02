const prisma = require('./prisma');

async function findAllByTenantId(tenantId) {
  return prisma.tenantIntegration.findMany({ where: { tenantId } });
}

async function findByTenantAndProvider(tenantId, provider) {
  return prisma.tenantIntegration.findUnique({
    where: { tenantId_provider: { tenantId, provider } },
  });
}

async function upsert(tenantId, provider, data) {
  return prisma.tenantIntegration.upsert({
    where: { tenantId_provider: { tenantId, provider } },
    create: { tenantId, provider, ...data },
    update: data,
  });
}

async function remove(tenantId, provider) {
  return prisma.tenantIntegration.deleteMany({ where: { tenantId, provider } });
}

module.exports = { findAllByTenantId, findByTenantAndProvider, upsert, remove };
