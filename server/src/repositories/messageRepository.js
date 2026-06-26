const prisma = require('./prisma');

async function existsByWamid(wamid) {
  const msg = await prisma.message.findUnique({
    where: { wamid },
    select: { id: true },
  });
  return !!msg;
}

async function create(data) {
  return prisma.message.create({ data });
}

async function getRecentByConversation(conversationId, limit = 10) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { direction: true, content: true },
  });
  return messages.reverse(); // ordem cronológica (asc) para o contexto da IA
}

async function findByConversation(conversationId, tenantId) {
  return prisma.message.findMany({
    where: { conversationId, tenantId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      direction: true,
      status: true,
      aiGenerated: true,
      content: true,
      wamid: true,
      sentAt: true,
      createdAt: true,
    },
  });
}

module.exports = { existsByWamid, create, getRecentByConversation, findByConversation };
