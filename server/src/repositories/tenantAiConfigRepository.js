const prisma = require('./prisma');

async function findByTenantId(tenantId) {
  return prisma.tenantAiConfig.findUnique({ where: { tenantId } });
}

async function upsert(tenantId, data) {
  return prisma.tenantAiConfig.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

module.exports = { findByTenantId, upsert };
