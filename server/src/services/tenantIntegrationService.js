const tenantIntegrationRepository = require('../repositories/tenantIntegrationRepository');
const encryption = require('../utils/encryption');
const auditLogService = require('./auditLogService');
const AppError = require('../utils/AppError');

// Nunca retorna as credenciais — só se estão configuradas ou não.
function redact(row) {
  if (!row) return null;
  const { credentialsEncrypted, ...rest } = row;
  return { ...rest, credentialsConfigured: !!credentialsEncrypted };
}

async function list(tenantId) {
  const rows = await tenantIntegrationRepository.findAllByTenantId(tenantId);
  return rows.map(redact);
}

async function connect(tenantId, userId, provider, { credentials, metadata, providerVersion }) {
  const before = redact(await tenantIntegrationRepository.findByTenantAndProvider(tenantId, provider));

  const data = { status: 'CONNECTED', connectedAt: new Date(), providerVersion, metadata, lastError: null };
  if (credentials) {
    data.credentialsEncrypted = encryption.encrypt(JSON.stringify(credentials));
  }
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  const row = await tenantIntegrationRepository.upsert(tenantId, provider, data);
  const after = redact(row);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'CONNECT_INTEGRATION',
    resource: `TenantIntegration:${provider}`,
    oldValue: before,
    newValue: after,
  });

  return after;
}

async function disconnect(tenantId, userId, provider) {
  const before = redact(await tenantIntegrationRepository.findByTenantAndProvider(tenantId, provider));
  if (!before) {
    throw new AppError('Integração não encontrada.', 404);
  }

  const row = await tenantIntegrationRepository.upsert(tenantId, provider, {
    status: 'NOT_CONNECTED',
    credentialsEncrypted: null,
    connectedAt: null,
  });
  const after = redact(row);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'DISCONNECT_INTEGRATION',
    resource: `TenantIntegration:${provider}`,
    oldValue: before,
    newValue: after,
  });

  return after;
}

module.exports = { list, connect, disconnect };
