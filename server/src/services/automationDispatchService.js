const crypto = require('crypto');
const domainEvents = require('../utils/domainEvents');
const automationWebhookRepository = require('../repositories/automationWebhookRepository');
const automationDispatchLogRepository = require('../repositories/automationDispatchLogRepository');
const encryption = require('../utils/encryption');
const urlSecurity = require('../utils/urlSecurity');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const {
  AUTOMATION_EVENT_NAMES,
  AUTOMATION_PAYLOAD_VERSION,
  AUTOMATION_DISPATCH_TIMEOUT_MS,
  AUTOMATION_RETRY_DELAYS_MS,
  AUTOMATION_MAX_PAYLOAD_BYTES,
  AUTOMATION_USER_AGENT,
} = require('../constants/automation');

const MAX_ATTEMPTS = AUTOMATION_RETRY_DELAYS_MS.length + 1;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildEnvelope(event, tenantId, eventId, deliveryId, data) {
  return {
    apiVersion: AUTOMATION_PAYLOAD_VERSION,
    event: AUTOMATION_EVENT_NAMES[event],
    tenantId,
    eventId,
    deliveryId,
    occurredAt: new Date().toISOString(),
    data,
  };
}

// Nunca lança — falha ao gravar log não pode derrubar o disparo.
async function logAttempt(fields) {
  try {
    await automationDispatchLogRepository.create(fields);
  } catch (err) {
    logger.error('[automation] falha ao gravar log de disparo', {
      webhookId: fields.webhookId,
      event: fields.event,
      message: err.message,
    });
  }
}

async function markSuccess(webhook) {
  try {
    await automationWebhookRepository.update(webhook.id, { lastError: null, lastSuccessAt: new Date() });
  } catch (err) {
    logger.error('[automation] falha ao atualizar lastSuccessAt', { webhookId: webhook.id, message: err.message });
  }
}

async function markFailure(webhook, errorMessage) {
  try {
    await automationWebhookRepository.update(webhook.id, { lastError: errorMessage });
  } catch (err) {
    logger.error('[automation] falha ao atualizar lastError', { webhookId: webhook.id, message: err.message });
  }
}

// Uma única tentativa HTTP — nunca lança, sempre retorna um resultado
// classificado (inclusive durationMs em timeouts e erros de rede).
async function attemptDelivery(webhook, envelope, body) {
  const start = Date.now();

  try {
    const secret = encryption.decrypt(webhook.signingSecretEnc);
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': AUTOMATION_USER_AGENT,
        'X-Automation-Signature': `sha256=${signature}`,
        'X-Automation-Event': envelope.event,
        'X-Automation-Delivery': envelope.deliveryId,
      },
      body,
      signal: AbortSignal.timeout(AUTOMATION_DISPATCH_TIMEOUT_MS),
    });

    const durationMs = Date.now() - start;

    if (response.ok) {
      return { success: true, httpStatus: response.status, durationMs };
    }

    return {
      success: false,
      httpStatus: response.status,
      durationMs,
      retryable: response.status >= 500,
      errorType: 'HTTP_ERROR',
      errorMessage: `HTTP ${response.status}`,
    };
  } catch (err) {
    const durationMs = Date.now() - start;
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';

    return {
      success: false,
      httpStatus: null,
      durationMs,
      retryable: true,
      errorType: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
      errorMessage: err.message,
    };
  }
}

// Registra uma falha definitiva (sem tentar enviar) — usado para payload
// grande demais ou URL bloqueada por segurança (SSRF). Attempt fixo em 1,
// nunca repete: são condições estáticas, não transitórias.
async function recordImmediateFailure({ webhook, event, eventId, deliveryId, envelope, errorType, errorMessage }) {
  await logAttempt({
    tenantId: webhook.tenantId,
    webhookId: webhook.id,
    event,
    eventId,
    deliveryId,
    urlSnapshot: webhook.url,
    payload: envelope,
    attempt: 1,
    httpStatus: null,
    success: false,
    errorType,
    errorMessage,
    durationMs: 0,
  });
  await markFailure(webhook, errorMessage);
}

// Entrega um evento a UM webhook específico — HMAC, timeout, retries e logs
// isolados dessa entrega. Nunca lança: qualquer falha é registrada e engolida.
async function sendToWebhook(webhook, event, eventId, data) {
  const deliveryId = crypto.randomUUID();
  const envelope = buildEnvelope(event, webhook.tenantId, eventId, deliveryId, data);
  const body = JSON.stringify(envelope);
  const bodySize = Buffer.byteLength(body, 'utf8');

  if (bodySize > AUTOMATION_MAX_PAYLOAD_BYTES) {
    await recordImmediateFailure({
      webhook,
      event,
      eventId,
      deliveryId,
      envelope,
      errorType: 'PAYLOAD_TOO_LARGE',
      errorMessage: `Payload de ${bodySize} bytes excede o limite de ${AUTOMATION_MAX_PAYLOAD_BYTES} bytes.`,
    });
    return;
  }

  // Revalida a URL a cada disparo — protege contra DNS rebinding (a URL era
  // pública na criação/edição, mas o IP pode ter mudado desde então).
  try {
    await urlSecurity.assertPublicHttpsUrl(webhook.url);
  } catch (err) {
    await recordImmediateFailure({
      webhook,
      event,
      eventId,
      deliveryId,
      envelope,
      errorType: 'BLOCKED_URL',
      errorMessage: err.message,
    });
    return;
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const result = await attemptDelivery(webhook, envelope, body);

    await logAttempt({
      tenantId: webhook.tenantId,
      webhookId: webhook.id,
      event,
      eventId,
      deliveryId,
      urlSnapshot: webhook.url,
      payload: envelope,
      attempt,
      httpStatus: result.httpStatus,
      success: result.success,
      errorType: result.errorType ?? null,
      errorMessage: result.errorMessage ?? null,
      durationMs: result.durationMs,
    });

    if (result.success) {
      await markSuccess(webhook);
      return;
    }

    if (!result.retryable || attempt === MAX_ATTEMPTS) {
      await markFailure(webhook, result.errorMessage);
      return;
    }

    await sleep(AUTOMATION_RETRY_DELAYS_MS[attempt - 1]);
  }
}

// Ponto de entrada do fan-out — chamado pelos listeners de domainEvents.
// Nunca lança (é sempre invocado com .catch pelo listener), mas mantemos a
// própria função robusta: uma falha ao buscar webhooks não deve propagar.
async function dispatch(event, { tenantId, data }) {
  const webhooks = await automationWebhookRepository.findAllByTenantAndEvent(tenantId, event);
  if (webhooks.length === 0) return;

  const eventId = crypto.randomUUID();
  await Promise.allSettled(webhooks.map((webhook) => sendToWebhook(webhook, event, eventId, data)));
}

// Registra os listeners uma única vez, no require deste módulo (chamado a
// partir de app.js no boot do processo — nunca pelos services de negócio).
Object.keys(AUTOMATION_EVENT_NAMES).forEach((enumValue) => {
  if (enumValue === 'AUTOMATION_TEST') return; // disparado só via sendTest, nunca por evento real
  const eventName = AUTOMATION_EVENT_NAMES[enumValue];
  domainEvents.on(eventName, (payload) => {
    dispatch(enumValue, payload).catch((err) =>
      logger.error('[automation] falha não tratada no dispatch', { event: enumValue, message: err.message })
    );
  });
});

// Disparo manual de teste — uma única tentativa, sem retry, aguardada de
// forma síncrona pelo controller (feedback imediato para quem clicou em
// "Testar webhook"), diferente do fluxo real que é sempre fire-and-forget.
async function sendTest(webhookId, tenantId) {
  const webhook = await automationWebhookRepository.findById(webhookId, tenantId);
  if (!webhook) {
    throw new AppError('Webhook não encontrado.', 404);
  }

  const eventId = crypto.randomUUID();
  const deliveryId = crypto.randomUUID();
  const envelope = buildEnvelope('AUTOMATION_TEST', tenantId, eventId, deliveryId, {
    message: 'Evento de teste do Motor de Automações.',
  });
  const body = JSON.stringify(envelope);
  const bodySize = Buffer.byteLength(body, 'utf8');

  if (bodySize > AUTOMATION_MAX_PAYLOAD_BYTES) {
    throw new AppError('Payload de teste excede o tamanho máximo permitido.', 422);
  }

  await urlSecurity.assertPublicHttpsUrl(webhook.url);

  const result = await attemptDelivery(webhook, envelope, body);

  await logAttempt({
    tenantId,
    webhookId: webhook.id,
    event: 'AUTOMATION_TEST',
    eventId,
    deliveryId,
    urlSnapshot: webhook.url,
    payload: envelope,
    attempt: 1,
    httpStatus: result.httpStatus,
    success: result.success,
    errorType: result.errorType ?? null,
    errorMessage: result.errorMessage ?? null,
    durationMs: result.durationMs,
  });

  if (result.success) {
    await markSuccess(webhook);
  } else {
    await markFailure(webhook, result.errorMessage);
  }

  return {
    success: result.success,
    httpStatus: result.httpStatus,
    errorMessage: result.errorMessage ?? null,
    durationMs: result.durationMs,
  };
}

async function listLogs(webhookId, tenantId, { page, perPage, success } = {}) {
  const webhook = await automationWebhookRepository.findById(webhookId, tenantId);
  if (!webhook) {
    throw new AppError('Webhook não encontrado.', 404);
  }

  return automationDispatchLogRepository.findAllByWebhookId({
    webhookId,
    tenantId,
    page: Math.max(1, parseInt(page) || 1),
    perPage: Math.min(100, Math.max(1, parseInt(perPage) || 20)),
    success,
  });
}

const STATS_WINDOW_MS = 24 * 60 * 60 * 1000;

// Painel-resumo do frontend: webhooks ativos + métricas de entrega nas
// últimas 24h. Uma entrega (deliveryId) conta como bem-sucedida se QUALQUER
// uma das suas tentativas teve sucesso — o loop de retry para na primeira.
async function getStats(tenantId) {
  const activeWebhooks = await automationWebhookRepository.countActiveByTenantId(tenantId);

  const since = new Date(Date.now() - STATS_WINDOW_MS);
  const rows = await automationDispatchLogRepository.findRecentByTenantId(tenantId, since);

  const successByDelivery = new Map();
  for (const row of rows) {
    successByDelivery.set(row.deliveryId, (successByDelivery.get(row.deliveryId) ?? false) || row.success);
  }

  const eventsLast24h = successByDelivery.size;
  const successfulDeliveries = [...successByDelivery.values()].filter(Boolean).length;
  const failuresLast24h = eventsLast24h - successfulDeliveries;
  const successRate = eventsLast24h === 0 ? null : successfulDeliveries / eventsLast24h;

  return { activeWebhooks, eventsLast24h, successRate, failuresLast24h };
}

module.exports = { dispatch, sendTest, listLogs, getStats };
