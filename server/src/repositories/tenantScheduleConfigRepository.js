const prisma = require('./prisma');

async function findByTenantId(tenantId) {
  return prisma.tenantScheduleConfig.findUnique({ where: { tenantId } });
}

async function upsert(tenantId, data) {
  return prisma.tenantScheduleConfig.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

module.exports = { findByTenantId, upsert };
