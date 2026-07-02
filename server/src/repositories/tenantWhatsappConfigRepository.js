const prisma = require('./prisma');

async function findByTenantId(tenantId) {
  return prisma.tenantWhatsappConfig.findUnique({ where: { tenantId } });
}

async function upsert(tenantId, data) {
  return prisma.tenantWhatsappConfig.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
  });
}

module.exports = { findByTenantId, upsert };
