jest.mock('../repositories/tenantAiConfigRepository');
jest.mock('../repositories/tenantRepository');
jest.mock('../utils/encryption');
jest.mock('./../services/auditLogService');

const tenantAiConfigRepository = require('../repositories/tenantAiConfigRepository');
const tenantRepository = require('../repositories/tenantRepository');
const encryption = require('../utils/encryption');
const auditLogService = require('../services/auditLogService');
const { getMasked, getEffectiveConfig, update } = require('../services/tenantAiConfigService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

const CONFIG_ROW = {
  tenantId: TENANT_ID,
  openAiApiKeyEncrypted: 'v1:iv:tag:ciphertext',
  openAiModel: 'gpt-4o',
  customPrompt: 'Sempre mencione o desconto de primeira consulta.',
  temperature: 0.7,
  maxTokens: 500,
};

beforeEach(() => {
  jest.clearAllMocks();
  tenantRepository.findByIdProfile.mockResolvedValue({ aiEnabled: true });
});

describe('tenantAiConfigService.getMasked', () => {
  it('nunca retorna a chave — só se está configurada', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(CONFIG_ROW);

    const result = await getMasked(TENANT_ID);

    expect(result.openAiApiKeyEncrypted).toBeUndefined();
    expect(result.openAiApiKeyConfigured).toBe(true);
    expect(result.openAiModel).toBe('gpt-4o');
  });

  it('retorna defaults quando o tenant não tem config própria', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(null);

    const result = await getMasked(TENANT_ID);

    expect(result.openAiApiKeyConfigured).toBe(false);
    expect(result.openAiModel).toBeNull();
  });

  it('inclui o aiEnabled do Tenant', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(null);
    tenantRepository.findByIdProfile.mockResolvedValue({ aiEnabled: false });

    const result = await getMasked(TENANT_ID);

    expect(result.aiEnabled).toBe(false);
  });
});

describe('tenantAiConfigService.getEffectiveConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('decripta a chave e usa os valores do tenant quando configurados', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(CONFIG_ROW);
    encryption.decrypt.mockReturnValue('sk-chave-do-tenant');

    const result = await getEffectiveConfig(TENANT_ID);

    expect(encryption.decrypt).toHaveBeenCalledWith(CONFIG_ROW.openAiApiKeyEncrypted);
    expect(result).toEqual({
      apiKey: 'sk-chave-do-tenant',
      model: 'gpt-4o',
      customPrompt: CONFIG_ROW.customPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });
  });

  it('cai para as variáveis de ambiente quando o tenant não tem config própria', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(null);
    process.env.OPENAI_API_KEY = 'sk-chave-global';
    process.env.OPENAI_MODEL = 'gpt-4o-mini';
    process.env.OPENAI_MAX_TOKENS = '300';

    const result = await getEffectiveConfig(TENANT_ID);

    expect(encryption.decrypt).not.toHaveBeenCalled();
    expect(result.apiKey).toBe('sk-chave-global');
    expect(result.model).toBe('gpt-4o-mini');
    expect(result.maxTokens).toBe(300);
    expect(result.customPrompt).toBeNull();
  });
});

describe('tenantAiConfigService.update', () => {
  it('criptografa a chave antes de persistir, nunca em texto puro', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(null);
    encryption.encrypt.mockReturnValue('v1:encrypted-payload');
    tenantAiConfigRepository.upsert.mockResolvedValue({ ...CONFIG_ROW, openAiApiKeyEncrypted: 'v1:encrypted-payload' });

    await update(TENANT_ID, USER_ID, { openAiApiKey: 'sk-nova-chave' });

    expect(encryption.encrypt).toHaveBeenCalledWith('sk-nova-chave');
    const upsertData = tenantAiConfigRepository.upsert.mock.calls[0][1];
    expect(upsertData.openAiApiKeyEncrypted).toBe('v1:encrypted-payload');
    expect(upsertData).not.toHaveProperty('openAiApiKey');
  });

  it('atualiza aiEnabled no Tenant quando fornecido', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(null);

    await update(TENANT_ID, USER_ID, { aiEnabled: false });

    expect(tenantRepository.updateAiEnabled).toHaveBeenCalledWith(TENANT_ID, false);
  });

  it('não sobrescreve campos não enviados (atualização parcial)', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(CONFIG_ROW);
    tenantAiConfigRepository.upsert.mockResolvedValue(CONFIG_ROW);

    await update(TENANT_ID, USER_ID, { temperature: 1.2 });

    const upsertData = tenantAiConfigRepository.upsert.mock.calls[0][1];
    expect(upsertData).toEqual({ temperature: 1.2 });
  });

  it('registra auditoria sem expor a chave em texto puro', async () => {
    tenantAiConfigRepository.findByTenantId.mockResolvedValue(null);
    encryption.encrypt.mockReturnValue('v1:encrypted-payload');
    tenantAiConfigRepository.upsert.mockResolvedValue({ ...CONFIG_ROW, openAiApiKeyEncrypted: 'v1:encrypted-payload' });

    await update(TENANT_ID, USER_ID, { openAiApiKey: 'sk-nova-chave' });

    expect(auditLogService.record).toHaveBeenCalledTimes(1);
    const { newValue, oldValue } = auditLogService.record.mock.calls[0][0];
    expect(JSON.stringify(newValue)).not.toContain('sk-nova-chave');
    expect(JSON.stringify(oldValue)).not.toContain('sk-nova-chave');
  });
});
