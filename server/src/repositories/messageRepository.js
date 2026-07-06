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

/**
 * Busca uma mensagem pelo id, garantindo isolamento por tenantId.
 * Inclui lead.phoneNormalized e tenant.whatsappPhoneNumberId para o serviço de envio.
 */
async function findByIdWithRelations(id, tenantId) {
  return prisma.message.findFirst({
    where: { id, tenantId },
    include: {
      lead:   { select: { phoneNormalized: true } },
      tenant: { select: { whatsappPhoneNumberId: true } },
    },
  });
}

/**
 * Guarda atômica: altera status de DRAFT → PENDING apenas se o registro ainda for DRAFT.
 * Retorna { count } — se count === 0, outro processo já agiu sobre a mensagem.
 */
async function markInFlight(id, tenantId) {
  return prisma.message.updateMany({
    where: { id, tenantId, status: 'DRAFT' },
    data: { status: 'PENDING' },
  });
}

/**
 * Marca a mensagem como SENT após confirmação da Meta.
 * Prepara campos para o ciclo SENT → DELIVERED → READ (futuro via webhooks de status).
 */
async function markSent(id, { wamid, sentAt, metadata }) {
  return prisma.message.update({
    where: { id },
    data: { status: 'SENT', wamid, sentAt, metadata },
    select: { id: true, status: true, wamid: true, sentAt: true },
  });
}

/**
 * Marca a mensagem como FAILED e persiste metadados do erro para diagnóstico.
 */
async function markFailed(id, metadata) {
  return prisma.message.update({
    where: { id },
    data: { status: 'FAILED', metadata },
    select: { id: true, status: true },
  });
}

async function findByLeadId(leadId, tenantId) {
  return prisma.message.findMany({
    where: { leadId, tenantId },
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
      conversationId: true,
    },
  });
}

module.exports = {
  existsByWamid,
  create,
  getRecentByConversation,
  findByConversation,
  findByIdWithRelations,
  markInFlight,
  markSent,
  markFailed,
  findByLeadId,
};
