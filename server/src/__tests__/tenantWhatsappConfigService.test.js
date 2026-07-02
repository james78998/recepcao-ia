jest.mock('../repositories/tenantWhatsappConfigRepository');
jest.mock('../utils/encryption');
jest.mock('../services/auditLogService');

const tenantWhatsappConfigRepository = require('../repositories/tenantWhatsappConfigRepository');
const encryption = require('../utils/encryption');
const auditLogService = require('../services/auditLogService');
const { getMasked, getEffectiveConfig, update } = require('../services/tenantWhatsappConfigService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

const CONFIG_ROW = {
  tenantId: TENANT_ID,
  accessTokenEncrypted: 'v1:iv:tag:ciphertext',
  businessAccountId: 'waba-123',
  displayName: 'Clínica Teste',
  connectionStatus: 'CONNECTED',
  webhookVerified: false,
  connectedAt: new Date('2026-01-01'),
  lastSync: null,
  lastError: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantWhatsappConfigService.getMasked', () => {
  it('nunca retorna o token — só se está configurado', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(CONFIG_ROW);

    const result = await getMasked(TENANT_ID);

    expect(result.accessTokenEncrypted).toBeUndefined();
    expect(result.accessTokenConfigured).toBe(true);
    expect(result.businessAccountId).toBe('waba-123');
  });

  it('retorna NOT_CONNECTED por padrão quando não configurado', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(null);

    const result = await getMasked(TENANT_ID);

    expect(result.connectionStatus).toBe('NOT_CONNECTED');
    expect(result.accessTokenConfigured).toBe(false);
  });
});

describe('tenantWhatsappConfigService.getEffectiveConfig', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('decripta o token do tenant quando configurado', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(CONFIG_ROW);
    encryption.decrypt.mockReturnValue('token-do-tenant');

    const result = await getEffectiveConfig(TENANT_ID);

    expect(encryption.decrypt).toHaveBeenCalledWith(CONFIG_ROW.accessTokenEncrypted);
    expect(result.token).toBe('token-do-tenant');
  });

  it('cai para WHATSAPP_TOKEN quando o tenant não configurou token próprio', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(null);
    process.env.WHATSAPP_TOKEN = 'token-global';

    const result = await getEffectiveConfig(TENANT_ID);

    expect(encryption.decrypt).not.toHaveBeenCalled();
    expect(result.token).toBe('token-global');
  });
});

describe('tenantWhatsappConfigService.update', () => {
  it('criptografa o token antes de persistir e marca CONNECTED', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(null);
    encryption.encrypt.mockReturnValue('v1:encrypted-token');
    tenantWhatsappConfigRepository.upsert.mockResolvedValue({ ...CONFIG_ROW, accessTokenEncrypted: 'v1:encrypted-token' });

    await update(TENANT_ID, USER_ID, { accessToken: 'EAAG-token-real' });

    expect(encryption.encrypt).toHaveBeenCalledWith('EAAG-token-real');
    const upsertData = tenantWhatsappConfigRepository.upsert.mock.calls[0][1];
    expect(upsertData.accessTokenEncrypted).toBe('v1:encrypted-token');
    expect(upsertData.connectionStatus).toBe('CONNECTED');
    expect(upsertData).not.toHaveProperty('accessToken');
  });

  it('não altera o token quando não enviado (só businessAccountId/displayName)', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(CONFIG_ROW);
    tenantWhatsappConfigRepository.upsert.mockResolvedValue(CONFIG_ROW);

    await update(TENANT_ID, USER_ID, { displayName: 'Novo nome' });

    expect(encryption.encrypt).not.toHaveBeenCalled();
    const upsertData = tenantWhatsappConfigRepository.upsert.mock.calls[0][1];
    expect(upsertData).toEqual({ displayName: 'Novo nome' });
  });

  it('registra auditoria sem expor o token em texto puro', async () => {
    tenantWhatsappConfigRepository.findByTenantId.mockResolvedValue(null);
    encryption.encrypt.mockReturnValue('v1:encrypted-token');
    tenantWhatsappConfigRepository.upsert.mockResolvedValue({ ...CONFIG_ROW, accessTokenEncrypted: 'v1:encrypted-token' });

    await update(TENANT_ID, USER_ID, { accessToken: 'EAAG-token-real' });

    const { newValue, oldValue } = auditLogService.record.mock.calls[0][0];
    expect(JSON.stringify(newValue)).not.toContain('EAAG-token-real');
    expect(JSON.stringify(oldValue)).not.toContain('EAAG-token-real');
  });
});
