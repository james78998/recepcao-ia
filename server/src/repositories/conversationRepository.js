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

async function findAll(tenantId) {
  return prisma.conversation.findMany({
    where: { tenantId },
    include: {
      lead: { select: { id: true, name: true, phone: true, status: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, direction: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });
}

async function findById(id, tenantId) {
  return prisma.conversation.findFirst({
    where: { id, tenantId },
    include: {
      lead: { select: { id: true, name: true, phone: true, status: true } },
    },
  });
}

module.exports = { findOpenByLead, create, findAll, findById };
