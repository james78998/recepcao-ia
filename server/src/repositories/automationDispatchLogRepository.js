const prisma = require('./prisma');

async function create(data) {
  return prisma.automationDispatchLog.create({ data });
}

async function findAllByWebhookId({ webhookId, tenantId, page = 1, perPage = 20, success }) {
  const where = { webhookId, tenantId, ...(success !== undefined ? { success } : {}) };

  const [total, data] = await Promise.all([
    prisma.automationDispatchLog.count({ where }),
    prisma.automationDispatchLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ]);

  return {
    data,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) || 1 },
  };
}

// Usado pelo painel-resumo (GET /stats) — traz só o necessário para agrupar
// por deliveryId em memória (uma entrega é bem-sucedida se QUALQUER tentativa
// dela teve sucesso).
async function findRecentByTenantId(tenantId, since) {
  return prisma.automationDispatchLog.findMany({
    where: { tenantId, createdAt: { gte: since } },
    select: { deliveryId: true, success: true },
  });
}

module.exports = { create, findAllByWebhookId, findRecentByTenantId };
