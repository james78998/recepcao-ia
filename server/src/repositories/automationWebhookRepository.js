const prisma = require('./prisma');

async function findAllByTenantId(tenantId) {
  return prisma.automationWebhook.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
}

async function findById(id, tenantId) {
  return prisma.automationWebhook.findFirst({ where: { id, tenantId, deletedAt: null } });
}

async function countByTenantId(tenantId) {
  return prisma.automationWebhook.count({ where: { tenantId, deletedAt: null } });
}

// Usado pelo painel-resumo do frontend (GET /stats).
async function countActiveByTenantId(tenantId) {
  return prisma.automationWebhook.count({ where: { tenantId, deletedAt: null, enabled: true } });
}

// Usado pelo fan-out do automationDispatchService — só webhooks ativos,
// não excluídos e inscritos no evento (array nativo Postgres via `has`).
async function findAllByTenantAndEvent(tenantId, event) {
  return prisma.automationWebhook.findMany({
    where: { tenantId, deletedAt: null, enabled: true, events: { has: event } },
  });
}

async function create(data) {
  return prisma.automationWebhook.create({ data });
}

async function update(id, data) {
  return prisma.automationWebhook.update({ where: { id }, data });
}

// Soft delete — nunca remove fisicamente, preserva histórico de auditoria.
async function softDelete(id) {
  return prisma.automationWebhook.update({
    where: { id },
    data: { deletedAt: new Date(), enabled: false },
  });
}

module.exports = {
  findAllByTenantId,
  findById,
  countByTenantId,
  countActiveByTenantId,
  findAllByTenantAndEvent,
  create,
  update,
  softDelete,
};
