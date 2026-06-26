const prisma = require('./prisma');

async function findOpenByLead(tenantId, leadId) {
  return prisma.conversation.findFirst({
    where: { tenantId, leadId, status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
  });
}

async function create(data) {
  return prisma.conversation.create({ data });
}

module.exports = { findOpenByLead, create };
