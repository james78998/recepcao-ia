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

module.exports = { existsByWamid, create, getRecentByConversation };
