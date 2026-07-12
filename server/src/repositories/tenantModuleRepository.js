const prisma = require('./prisma');

async function findAllByTenant(tenantId, db = prisma) {
  return db.tenantModule.findMany({
    where: { tenantId },
    include: { module: true },
  });
}

async function findEnabledKeysByTenant(tenantId, db = prisma) {
  const rows = await db.tenantModule.findMany({
    where: { tenantId, enabled: true },
    select: { module: { select: { key: true } } },
  });
  return rows.map((row) => row.module.key);
}

async function upsert({ tenantId, moduleId, enabled }, db = prisma) {
  return db.tenantModule.upsert({
    where: { tenantId_moduleId: { tenantId, moduleId } },
    update: { enabled },
    create: { tenantId, moduleId, enabled },
  });
}

// Usado no onboarding de um tenant novo e no backfill de tenants existentes —
// cria uma linha habilitada por módulo do catálogo, sem duplicar (idempotente
// via unique constraint [tenantId, moduleId]).
async function createManyEnabledForTenant(tenantId, moduleIds, db = prisma) {
  return db.tenantModule.createMany({
    data: moduleIds.map((moduleId) => ({ tenantId, moduleId, enabled: true })),
    skipDuplicates: true,
  });
}

module.exports = { findAllByTenant, findEnabledKeysByTenant, upsert, createManyEnabledForTenant };
