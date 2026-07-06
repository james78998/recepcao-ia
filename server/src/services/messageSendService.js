const messageRepository = require('../repositories/messageRepository');
const whatsappClient    = require('../integrations/meta/whatsappClient');
const tenantWhatsappConfigService = require('./tenantWhatsappConfigService');
const AppError          = require('../utils/AppError');
const logger            = require('../utils/logger');
const domainEvents       = require('../utils/domainEvents');
const { AUTOMATION_EVENT_NAMES } = require('../constants/automation');

/**
 * Envia uma mensagem DRAFT ao cliente via WhatsApp Cloud API.
 *
 * Fluxo:
 *   1. Localiza a mensagem com relações (lead, tenant)
 *   2. Valida status, configuração do tenant e telefone do lead
 *   3. Guarda atômica: DRAFT → PENDING (impede envio duplo por race condition)
 *   4. Chama a WhatsApp Cloud API
 *   5a. Sucesso: persiste SENT + wamid + waId + metadata
 *   5b. Falha:  persiste FAILED + erro, lança AppError adequado
 */
async function sendDraft(messageId, tenantId) {
  // 1. Busca mensagem com relações necessárias para o envio
  const message = await messageRepository.findByIdWithRelations(messageId, tenantId);

  if (!message) {
    throw new AppError('Mensagem não encontrada.', 404);
  }

  // 2. Validações de negócio
  if (message.status !== 'DRAFT') {
    throw new AppError('Mensagem já foi enviada ou está em processamento.', 409);
  }

  if (!message.tenant?.whatsappPhoneNumberId) {
    throw new AppError('Tenant sem WhatsApp configurado.', 422);
  }

  if (!message.lead?.phoneNormalized) {
    throw new AppError('Lead sem telefone válido para envio.', 422);
  }

  // 3. Guarda atômica: impede envio duplicado via race condition
  const guard = await messageRepository.markInFlight(messageId, tenantId);
  if (guard.count === 0) {
    throw new AppError('Mensagem já está sendo processada.', 409);
  }

  const { whatsappPhoneNumberId } = message.tenant;
  const to = `+${message.lead.phoneNormalized}`;
  const isDryRun = process.env.WHATSAPP_DRY_RUN === 'true';

  try {
    // 4. Chama a API da Meta (ou simula em dry-run)
    let metaResponse;
    if (isDryRun) {
      metaResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: to, wa_id: message.lead.phoneNormalized }],
        messages: [{ id: `wamid.dry-run.${Date.now()}` }],
      };
      logger.info('[send] WHATSAPP_DRY_RUN ativo — Meta API não foi chamada', { messageId });
    } else {
      const { token } = await tenantWhatsappConfigService.getEffectiveConfig(tenantId);
      metaResponse = await whatsappClient.sendMessage({
        phoneNumberId: whatsappPhoneNumberId,
        to,
        type: 'text',
        text: { body: message.content },
        token,
      });
    }

    const wamid = metaResponse?.messages?.[0]?.id ?? null;
    const waId  = metaResponse?.contacts?.[0]?.wa_id ?? null;

    if (!wamid) {
      logger.warn('[send] Meta não retornou wamid', { messageId });
    }

    // 5a. Persiste SENT
    const updated = await messageRepository.markSent(messageId, {
      wamid,
      sentAt: new Date(),
      metadata: { metaResponse, waId },
    });

    domainEvents.emit(AUTOMATION_EVENT_NAMES.MESSAGE_SENT, { tenantId, data: updated });

    logger.info('[send] mensagem enviada', { messageId, wamid });
    return updated;

  } catch (err) {
    // 5b. Persiste FAILED — tenta registrar o erro sem perder o original
    const isTimeout  = err.name === 'TimeoutError' || err.code === 'ERR_OPERATION_TIMED_OUT';
    const isMetaErr  = !!err.isMetaError;

    try {
      await messageRepository.markFailed(messageId, {
        error: err.message,
        failedAt: new Date().toISOString(),
      });
    } catch (persistErr) {
      logger.error('[send] falha ao persistir status FAILED', { messageId });
    }

    logger.error('[send] falha no envio', { messageId, httpStatus: err.status });

    if (isTimeout) {
      throw new AppError('Timeout ao chamar a API do WhatsApp.', 504);
    }
    if (isMetaErr) {
      throw new AppError('Erro da API do WhatsApp. Tente novamente.', 502);
    }
    throw err;
  }
}

module.exports = { sendDraft };
