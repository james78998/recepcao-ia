const crypto = require('crypto');
const automationWebhookRepository = require('../repositories/automationWebhookRepository');
const encryption = require('../utils/encryption');
const urlSecurity = require('../utils/urlSecurity');
const auditLogService = require('./auditLogService');
const AppError = require('../utils/AppError');
const { MAX_WEBHOOKS_PER_TENANT } = require('../constants/automation');

// Nunca retorna o secret — só se está configurado ou não.
function redact(row) {
  if (!row) return null;
  const { signingSecretEnc, ...rest } = row;
  return { ...rest, signingSecretConfigured: !!signingSecretEnc };
}

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

async function findOrThrow(id, tenantId) {
  const row = await automationWebhookRepository.findById(id, tenantId);
  if (!row) {
    throw new AppError('Webhook não encontrado.', 404);
  }
  return row;
}

async function list(tenantId) {
  const rows = await automationWebhookRepository.findAllByTenantId(tenantId);
  return rows.map(redact);
}

async function getById(id, tenantId) {
  return redact(await findOrThrow(id, tenantId));
}

async function create(tenantId, userId, { name, url, events, enabled }) {
  await urlSecurity.assertPublicHttpsUrl(url);

  const total = await automationWebhookRepository.countByTenantId(tenantId);
  if (total >= MAX_WEBHOOKS_PER_TENANT) {
    throw new AppError(`Limite de ${MAX_WEBHOOKS_PER_TENANT} webhooks por tenant atingido.`, 422);
  }

  const secret = generateSecret();
  const row = await automationWebhookRepository.create({
    tenantId,
    name,
    url,
    events,
    enabled: enabled ?? true,
    signingSecretEnc: encryption.encrypt(secret),
  });

  const after = redact(row);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'CREATE_AUTOMATION_WEBHOOK',
    resource: `AutomationWebhook:${row.id}`,
    oldValue: null,
    newValue: after,
  });

  // Secret em texto puro só é retornado aqui — nunca mais recuperável depois.
  return { ...after, signingSecret: secret };
}

async function update(id, tenantId, userId, { name, url, events, enabled }) {
  const before = redact(await findOrThrow(id, tenantId));

  if (url !== undefined) {
    await urlSecurity.assertPublicHttpsUrl(url);
  }

  const data = { name, url, events, enabled };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  const row = await automationWebhookRepository.update(id, data);
  const after = redact(row);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'UPDATE_AUTOMATION_WEBHOOK',
    resource: `AutomationWebhook:${id}`,
    oldValue: before,
    newValue: after,
  });

  return after;
}

async function remove(id, tenantId, userId) {
  const before = redact(await findOrThrow(id, tenantId));

  const row = await automationWebhookRepository.softDelete(id);
  const after = redact(row);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'DELETE_AUTOMATION_WEBHOOK',
    resource: `AutomationWebhook:${id}`,
    oldValue: before,
    newValue: after,
  });

  return after;
}

async function regenerateSecret(id, tenantId, userId) {
  const before = redact(await findOrThrow(id, tenantId));

  const secret = generateSecret();
  const row = await automationWebhookRepository.update(id, {
    signingSecretEnc: encryption.encrypt(secret),
  });
  const after = redact(row);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'REGENERATE_AUTOMATION_WEBHOOK_SECRET',
    resource: `AutomationWebhook:${id}`,
    oldValue: before,
    newValue: after,
  });

  return { ...after, signingSecret: secret };
}

module.exports = { list, getById, create, update, remove, regenerateSecret };
