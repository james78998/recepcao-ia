const tenantWhatsappConfigRepository = require('../repositories/tenantWhatsappConfigRepository');
const encryption = require('../utils/encryption');
const auditLogService = require('./auditLogService');

// Nunca retorna o token — só se está configurado ou não.
function redact(row) {
  if (!row) {
    return {
      businessAccountId: null,
      displayName: null,
      connectionStatus: 'NOT_CONNECTED',
      webhookVerified: false,
      connectedAt: null,
      lastSync: null,
      lastError: null,
      accessTokenConfigured: false,
    };
  }
  const { accessTokenEncrypted, ...rest } = row;
  return { ...rest, accessTokenConfigured: !!accessTokenEncrypted };
}

async function getMasked(tenantId) {
  const row = await tenantWhatsappConfigRepository.findByTenantId(tenantId);
  return redact(row);
}

// Uso interno (messageSendService) — decripta o token só na hora de chamar a Meta.
// Nunca deve ser exposto numa resposta HTTP.
async function getEffectiveConfig(tenantId) {
  const row = await tenantWhatsappConfigRepository.findByTenantId(tenantId);
  const token = row?.accessTokenEncrypted ? encryption.decrypt(row.accessTokenEncrypted) : process.env.WHATSAPP_TOKEN;
  return { token };
}

async function update(tenantId, userId, { accessToken, businessAccountId, displayName }) {
  const before = await getMasked(tenantId);

  const data = { businessAccountId, displayName };
  if (accessToken) {
    data.accessTokenEncrypted = encryption.encrypt(accessToken);
    // Otimista: marcamos CONNECTED ao salvar. Não há verificação ativa contra a
    // Meta nesta fase — ver "riscos técnicos" na proposta aprovada.
    data.connectionStatus = 'CONNECTED';
    data.connectedAt = new Date();
  }
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  if (Object.keys(data).length > 0) {
    await tenantWhatsappConfigRepository.upsert(tenantId, data);
  }

  const after = await getMasked(tenantId);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'UPDATE_WHATSAPP_CONFIG',
    resource: 'TenantWhatsappConfig',
    oldValue: before,
    newValue: after,
  });

  return after;
}

module.exports = { getMasked, getEffectiveConfig, update };
