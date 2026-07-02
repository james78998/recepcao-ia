jest.mock('../repositories/tenantIntegrationRepository');
jest.mock('../utils/encryption');
jest.mock('../services/auditLogService');

const tenantIntegrationRepository = require('../repositories/tenantIntegrationRepository');
const encryption = require('../utils/encryption');
const auditLogService = require('../services/auditLogService');
const { list, connect, disconnect } = require('../services/tenantIntegrationService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

const INTEGRATION_ROW = {
  id: 'integ-1',
  tenantId: TENANT_ID,
  provider: 'GOOGLE_CALENDAR',
  providerVersion: 'v3',
  status: 'CONNECTED',
  credentialsEncrypted: 'v1:iv:tag:ciphertext',
  metadata: { calendarId: 'primary' },
  connectedAt: new Date('2026-01-01'),
  lastError: null,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantIntegrationService.list', () => {
  it('nunca retorna as credenciais — só se estão configuradas', async () => {
    tenantIntegrationRepository.findAllByTenantId.mockResolvedValue([INTEGRATION_ROW]);

    const result = await list(TENANT_ID);

    expect(result[0].credentialsEncrypted).toBeUndefined();
    expect(result[0].credentialsConfigured).toBe(true);
    expect(result[0].provider).toBe('GOOGLE_CALENDAR');
  });
});

describe('tenantIntegrationService.connect', () => {
  it('criptografa as credenciais como JSON antes de persistir', async () => {
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(null);
    encryption.encrypt.mockReturnValue('v1:encrypted-json');
    tenantIntegrationRepository.upsert.mockResolvedValue({ ...INTEGRATION_ROW, credentialsEncrypted: 'v1:encrypted-json' });

    const credentials = { apiKey: 'chave-dental-office-123' };
    await connect(TENANT_ID, USER_ID, 'DENTAL_OFFICE', { credentials, providerVersion: 'v1' });

    expect(encryption.encrypt).toHaveBeenCalledWith(JSON.stringify(credentials));
    const upsertData = tenantIntegrationRepository.upsert.mock.calls[0][2];
    expect(upsertData.credentialsEncrypted).toBe('v1:encrypted-json');
    expect(upsertData.status).toBe('CONNECTED');
    expect(upsertData).not.toHaveProperty('credentials');
  });

  it('marca status CONNECTED e connectedAt mesmo sem credenciais novas', async () => {
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(INTEGRATION_ROW);
    tenantIntegrationRepository.upsert.mockResolvedValue(INTEGRATION_ROW);

    await connect(TENANT_ID, USER_ID, 'GOOGLE_CALENDAR', { metadata: { calendarId: 'novo' } });

    const upsertData = tenantIntegrationRepository.upsert.mock.calls[0][2];
    expect(upsertData.status).toBe('CONNECTED');
    expect(upsertData.metadata).toEqual({ calendarId: 'novo' });
    expect(encryption.encrypt).not.toHaveBeenCalled();
  });

  it('registra auditoria sem expor a credencial em texto puro', async () => {
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(null);
    encryption.encrypt.mockReturnValue('v1:encrypted-json');
    tenantIntegrationRepository.upsert.mockResolvedValue({ ...INTEGRATION_ROW, credentialsEncrypted: 'v1:encrypted-json' });

    await connect(TENANT_ID, USER_ID, 'DENTAL_OFFICE', { credentials: { apiKey: 'segredo-123' } });

    const { newValue, oldValue } = auditLogService.record.mock.calls[0][0];
    expect(JSON.stringify(newValue)).not.toContain('segredo-123');
    expect(JSON.stringify(oldValue)).not.toContain('segredo-123');
  });
});

describe('tenantIntegrationService.disconnect', () => {
  it('lança 404 quando a integração não existe', async () => {
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(null);

    await expect(disconnect(TENANT_ID, USER_ID, 'GOOGLE_CALENDAR')).rejects.toMatchObject({ status: 404 });
    expect(tenantIntegrationRepository.upsert).not.toHaveBeenCalled();
  });

  it('limpa as credenciais e marca NOT_CONNECTED', async () => {
    tenantIntegrationRepository.findByTenantAndProvider.mockResolvedValue(INTEGRATION_ROW);
    tenantIntegrationRepository.upsert.mockResolvedValue({ ...INTEGRATION_ROW, status: 'NOT_CONNECTED', credentialsEncrypted: null });

    await disconnect(TENANT_ID, USER_ID, 'GOOGLE_CALENDAR');

    expect(tenantIntegrationRepository.upsert).toHaveBeenCalledWith(TENANT_ID, 'GOOGLE_CALENDAR', {
      status: 'NOT_CONNECTED',
      credentialsEncrypted: null,
      connectedAt: null,
    });
  });
});
