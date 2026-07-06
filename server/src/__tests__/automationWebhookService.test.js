jest.mock('../repositories/automationWebhookRepository');
jest.mock('../utils/encryption');
jest.mock('../utils/urlSecurity');
jest.mock('../services/auditLogService');

const automationWebhookRepository = require('../repositories/automationWebhookRepository');
const encryption = require('../utils/encryption');
const urlSecurity = require('../utils/urlSecurity');
const auditLogService = require('../services/auditLogService');
const {
  list,
  getById,
  create,
  update,
  remove,
  regenerateSecret,
} = require('../services/automationWebhookService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

const WEBHOOK_ROW = {
  id: 'webhook-1',
  tenantId: TENANT_ID,
  name: 'n8n — Qualificação',
  url: 'https://n8n.exemplo.com/webhook/abc',
  signingSecretEnc: 'v1:iv:tag:ciphertext',
  enabled: true,
  events: ['LEAD_CREATED', 'LEAD_UPDATED'],
  lastError: null,
  lastSuccessAt: null,
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

beforeEach(() => {
  jest.clearAllMocks();
  urlSecurity.assertPublicHttpsUrl.mockResolvedValue(undefined);
  encryption.encrypt.mockReturnValue('v1:encrypted-secret');
});

describe('automationWebhookService.list', () => {
  it('nunca retorna o secret — só se está configurado', async () => {
    automationWebhookRepository.findAllByTenantId.mockResolvedValue([WEBHOOK_ROW]);

    const result = await list(TENANT_ID);

    expect(result[0].signingSecretEnc).toBeUndefined();
    expect(result[0].signingSecretConfigured).toBe(true);
    expect(result[0].name).toBe('n8n — Qualificação');
  });
});

describe('automationWebhookService.getById', () => {
  it('lança 404 quando o webhook não pertence ao tenant (ou não existe)', async () => {
    automationWebhookRepository.findById.mockResolvedValue(null);

    await expect(getById('webhook-x', TENANT_ID)).rejects.toMatchObject({ status: 404 });
  });
});

describe('automationWebhookService.create', () => {
  it('valida a URL antes de tudo', async () => {
    urlSecurity.assertPublicHttpsUrl.mockRejectedValue(new Error('URL inválida'));

    await expect(
      create(TENANT_ID, USER_ID, { name: 'Webhook', url: 'http://interno', events: ['LEAD_CREATED'] })
    ).rejects.toThrow('URL inválida');

    expect(automationWebhookRepository.create).not.toHaveBeenCalled();
  });

  it('rejeita ao atingir o limite de webhooks por tenant', async () => {
    automationWebhookRepository.countByTenantId.mockResolvedValue(20);

    await expect(
      create(TENANT_ID, USER_ID, { name: 'Webhook', url: 'https://exemplo.com/hook', events: ['LEAD_CREATED'] })
    ).rejects.toMatchObject({ status: 422 });

    expect(automationWebhookRepository.create).not.toHaveBeenCalled();
  });

  it('gera e criptografa o secret, retornando-o em texto puro apenas nesta chamada', async () => {
    automationWebhookRepository.countByTenantId.mockResolvedValue(0);
    automationWebhookRepository.create.mockResolvedValue(WEBHOOK_ROW);

    const result = await create(TENANT_ID, USER_ID, {
      name: 'n8n — Qualificação',
      url: 'https://n8n.exemplo.com/webhook/abc',
      events: ['LEAD_CREATED', 'LEAD_UPDATED'],
    });

    expect(encryption.encrypt).toHaveBeenCalled();
    expect(result.signingSecret).toEqual(expect.any(String));
    expect(result.signingSecretEnc).toBeUndefined();

    const createData = automationWebhookRepository.create.mock.calls[0][0];
    expect(createData.signingSecretEnc).toBe('v1:encrypted-secret');
  });

  it('registra auditoria sem expor o secret em texto puro', async () => {
    automationWebhookRepository.countByTenantId.mockResolvedValue(0);
    automationWebhookRepository.create.mockResolvedValue(WEBHOOK_ROW);

    await create(TENANT_ID, USER_ID, {
      name: 'n8n — Qualificação',
      url: 'https://n8n.exemplo.com/webhook/abc',
      events: ['LEAD_CREATED'],
    });

    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_ID, userId: USER_ID, action: 'CREATE_AUTOMATION_WEBHOOK' })
    );
    const { newValue } = auditLogService.record.mock.calls[0][0];
    expect(JSON.stringify(newValue)).not.toContain('v1:encrypted-secret');
  });
});

describe('automationWebhookService.update', () => {
  it('revalida a URL apenas quando ela é enviada', async () => {
    automationWebhookRepository.findById.mockResolvedValue(WEBHOOK_ROW);
    automationWebhookRepository.update.mockResolvedValue(WEBHOOK_ROW);

    await update('webhook-1', TENANT_ID, USER_ID, { name: 'Novo nome' });

    expect(urlSecurity.assertPublicHttpsUrl).not.toHaveBeenCalled();
  });

  it('lança 404 quando o webhook não pertence ao tenant', async () => {
    automationWebhookRepository.findById.mockResolvedValue(null);

    await expect(update('webhook-x', TENANT_ID, USER_ID, { name: 'X' })).rejects.toMatchObject({ status: 404 });
    expect(automationWebhookRepository.update).not.toHaveBeenCalled();
  });
});

describe('automationWebhookService.remove', () => {
  it('faz soft delete — nunca exclui fisicamente', async () => {
    automationWebhookRepository.findById.mockResolvedValue(WEBHOOK_ROW);
    automationWebhookRepository.softDelete.mockResolvedValue({
      ...WEBHOOK_ROW,
      enabled: false,
      deletedAt: new Date('2026-07-06'),
    });

    const result = await remove('webhook-1', TENANT_ID, USER_ID);

    expect(automationWebhookRepository.softDelete).toHaveBeenCalledWith('webhook-1');
    expect(result.deletedAt).not.toBeNull();
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE_AUTOMATION_WEBHOOK' })
    );
  });

  it('lança 404 quando o webhook não pertence ao tenant', async () => {
    automationWebhookRepository.findById.mockResolvedValue(null);

    await expect(remove('webhook-x', TENANT_ID, USER_ID)).rejects.toMatchObject({ status: 404 });
    expect(automationWebhookRepository.softDelete).not.toHaveBeenCalled();
  });
});

describe('automationWebhookService.regenerateSecret', () => {
  it('gera um novo secret e retorna em texto puro só nesta chamada', async () => {
    automationWebhookRepository.findById.mockResolvedValue(WEBHOOK_ROW);
    automationWebhookRepository.update.mockResolvedValue({ ...WEBHOOK_ROW, signingSecretEnc: 'v1:novo-secret' });

    const result = await regenerateSecret('webhook-1', TENANT_ID, USER_ID);

    expect(result.signingSecret).toEqual(expect.any(String));
    expect(result.signingSecretEnc).toBeUndefined();
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'REGENERATE_AUTOMATION_WEBHOOK_SECRET' })
    );
    const { oldValue, newValue } = auditLogService.record.mock.calls[0][0];
    expect(JSON.stringify(oldValue)).not.toContain('v1:iv:tag:ciphertext');
    expect(JSON.stringify(newValue)).not.toContain('v1:novo-secret');
  });
});
