const tenantAiConfigRepository = require('../repositories/tenantAiConfigRepository');
const tenantRepository = require('../repositories/tenantRepository');
const encryption = require('../utils/encryption');
const auditLogService = require('./auditLogService');

function defaultModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function defaultMaxTokens() {
  return parseInt(process.env.OPENAI_MAX_TOKENS || '300', 10);
}

// Nunca retorna a chave — só se está configurada ou não.
function redact(row) {
  if (!row) {
    return { openAiModel: null, customPrompt: null, temperature: null, maxTokens: null, openAiApiKeyConfigured: false };
  }
  const { openAiApiKeyEncrypted, ...rest } = row;
  return { ...rest, openAiApiKeyConfigured: !!openAiApiKeyEncrypted };
}

async function getMasked(tenantId) {
  const [aiConfigRow, tenant] = await Promise.all([
    tenantAiConfigRepository.findByTenantId(tenantId),
    tenantRepository.findByIdProfile(tenantId),
  ]);
  return { aiEnabled: tenant?.aiEnabled ?? true, ...redact(aiConfigRow) };
}

// Uso interno (aiService) — decripta a chave só na hora de chamar a OpenAI.
// Nunca deve ser exposto numa resposta HTTP.
async function getEffectiveConfig(tenantId) {
  const row = await tenantAiConfigRepository.findByTenantId(tenantId);
  const apiKey = row?.openAiApiKeyEncrypted
    ? encryption.decrypt(row.openAiApiKeyEncrypted)
    : process.env.OPENAI_API_KEY;

  return {
    apiKey,
    model: row?.openAiModel || defaultModel(),
    customPrompt: row?.customPrompt || null,
    temperature: row?.temperature ?? undefined,
    maxTokens: row?.maxTokens ?? defaultMaxTokens(),
  };
}

async function update(tenantId, userId, { aiEnabled, openAiApiKey, openAiModel, customPrompt, temperature, maxTokens }) {
  const before = await getMasked(tenantId);

  if (aiEnabled !== undefined) {
    await tenantRepository.updateAiEnabled(tenantId, aiEnabled);
  }

  const data = { openAiModel, customPrompt, temperature, maxTokens };
  if (openAiApiKey) {
    data.openAiApiKeyEncrypted = encryption.encrypt(openAiApiKey);
  }
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  if (Object.keys(data).length > 0) {
    await tenantAiConfigRepository.upsert(tenantId, data);
  }

  const after = await getMasked(tenantId);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'UPDATE_AI_CONFIG',
    resource: 'TenantAiConfig',
    oldValue: before,
    newValue: after,
  });

  return after;
}

module.exports = { getMasked, getEffectiveConfig, update };
