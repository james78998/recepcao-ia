const tenantRepository = require('../repositories/tenantRepository');
const leadRepository = require('../repositories/leadRepository');
const conversationRepository = require('../repositories/conversationRepository');
const messageRepository = require('../repositories/messageRepository');
const { normalizePhone } = require('../utils/phoneUtils');

/**
 * Encontra o Lead pelo número normalizado ou cria um novo com source=WHATSAPP.
 */
async function findOrCreateLead(tenantId, phoneNormalized) {
  let lead = await leadRepository.findByPhoneNormalized(tenantId, phoneNormalized);
  if (!lead) {
    lead = await leadRepository.create({
      tenantId,
      name: phoneNormalized,      // atualizado quando o nome for obtido via profile API
      phone: phoneNormalized,
      phoneNormalized,
      source: 'WHATSAPP',
      status: 'NOVO',
    });
    console.info(`[webhook] novo lead criado via WhatsApp: ${lead.id} (${phoneNormalized})`);
  }
  return lead;
}

/**
 * Encontra a Conversation aberta do Lead ou abre uma nova.
 */
async function findOrOpenConversation(tenantId, leadId) {
  let conversation = await conversationRepository.findOpenByLead(tenantId, leadId);
  if (!conversation) {
    conversation = await conversationRepository.create({
      tenantId,
      leadId,
      channel: 'WHATSAPP',
      status: 'OPEN',
    });
  }
  return conversation;
}

/**
 * Processa uma entrada (entry) do payload do webhook da Meta.
 * Cada entry corresponde a um WABA. Cada entry pode ter múltiplos changes.
 */
async function processInbound(entry) {
  const changes = entry?.changes ?? [];

  for (const change of changes) {
    if (change.field !== 'messages') continue;

    const value = change.value ?? {};
    const phoneNumberId = value.metadata?.phone_number_id;
    const incomingMessages = value.messages ?? [];

    if (!phoneNumberId || incomingMessages.length === 0) continue;

    // 1. Identifica o tenant pelo phone_number_id recebido no webhook
    const tenant = await tenantRepository.findByWhatsappPhoneNumberId(phoneNumberId);
    if (!tenant) {
      console.warn(`[webhook] phone_number_id sem tenant correspondente: ${phoneNumberId}`);
      continue;
    }

    for (const msg of incomingMessages) {
      if (msg.type !== 'text') {
        console.info(`[webhook] tipo de mensagem ignorado: ${msg.type}`);
        continue;
      }

      const wamid = msg.id;
      const from = normalizePhone(msg.from);
      const text = msg.text?.body ?? '';
      const sentAt = msg.timestamp
        ? new Date(Number(msg.timestamp) * 1000)
        : new Date();

      if (!wamid || !from || !text) continue;

      // 2. Idempotência — descarta mensagem já registrada
      if (await messageRepository.existsByWamid(wamid)) {
        console.info(`[webhook] mensagem já registrada, ignorando: ${wamid}`);
        continue;
      }

      // 3. Encontra ou cria Lead pelo número
      const lead = await findOrCreateLead(tenant.id, from);

      // 4. Encontra ou abre Conversation
      const conversation = await findOrOpenConversation(tenant.id, lead.id);

      // 5. Persiste a mensagem
      await messageRepository.create({
        tenantId: tenant.id,
        conversationId: conversation.id,
        leadId: lead.id,
        direction: 'INBOUND',
        content: text,
        wamid,
        sentAt,
      });

      console.info(`[webhook] mensagem recebida — lead: ${lead.id}, wamid: ${wamid}`);
    }
  }
}

module.exports = { processInbound, findOrCreateLead, findOrOpenConversation };
