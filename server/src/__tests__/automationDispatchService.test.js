jest.mock('../repositories/automationWebhookRepository');
jest.mock('../repositories/automationDispatchLogRepository');
jest.mock('../utils/encryption');
jest.mock('../utils/urlSecurity');
jest.mock('../utils/logger');
// Atrasos de retry reais (5s/30s) tornariam os testes lentos/instáveis —
// substitui só o backoff por valores mínimos, mantendo as demais constantes.
jest.mock('../constants/automation', () => ({
  ...jest.requireActual('../constants/automation'),
  AUTOMATION_RETRY_DELAYS_MS: [5, 5],
}));

const automationWebhookRepository = require('../repositories/automationWebhookRepository');
const automationDispatchLogRepository = require('../repositories/automationDispatchLogRepository');
const encryption = require('../utils/encryption');
const urlSecurity = require('../utils/urlSecurity');
const { dispatch, sendTest, listLogs, getStats } = require('../services/automationDispatchService');

const TENANT_ID = 'tenant-1';

function makeWebhook(overrides = {}) {
  return {
    id: 'webhook-1',
    tenantId: TENANT_ID,
    name: 'Webhook Teste',
    url: 'https://exemplo.com/hook',
    signingSecretEnc: 'v1:iv:tag:ciphertext',
    enabled: true,
    events: ['LEAD_CREATED'],
    deletedAt: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  urlSecurity.assertPublicHttpsUrl.mockResolvedValue(undefined);
  encryption.decrypt.mockReturnValue('plain-secret');
  global.fetch = jest.fn();
});

afterEach(() => {
  delete global.fetch;
});

describe('dispatch — fan-out', () => {
  it('não chama fetch quando não há webhook inscrito no evento', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([]);

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('dispara para os N webhooks inscritos, cada um com sua própria assinatura', async () => {
    const webhookA = makeWebhook({ id: 'webhook-a' });
    const webhookB = makeWebhook({ id: 'webhook-b' });
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([webhookA, webhookB]);
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(automationDispatchLogRepository.create).toHaveBeenCalledTimes(2);
  });

  it('falha em um webhook não impede o sucesso de gravar log do outro (Promise.allSettled)', async () => {
    const webhookOk = makeWebhook({ id: 'webhook-ok', url: 'https://ok.exemplo.com/hook' });
    const webhookFail = makeWebhook({ id: 'webhook-fail', url: 'https://falha.exemplo.com/hook' });
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([webhookOk, webhookFail]);

    global.fetch.mockImplementation((url) => {
      if (url === webhookFail.url) return Promise.reject(new Error('ECONNREFUSED'));
      return Promise.resolve({ ok: true, status: 200 });
    });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    const successLog = automationDispatchLogRepository.create.mock.calls.find(
      ([data]) => data.webhookId === 'webhook-ok'
    );
    expect(successLog[0].success).toBe(true);
  });

  it('emite o envelope com apiVersion, eventId e deliveryId', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    const [, options] = global.fetch.mock.calls[0];
    const sentBody = JSON.parse(options.body);
    expect(sentBody.apiVersion).toBe(1);
    expect(sentBody.event).toBe('lead.created');
    expect(sentBody.eventId).toEqual(expect.any(String));
    expect(sentBody.deliveryId).toEqual(expect.any(String));
    expect(sentBody.deliveryId).not.toBe(sentBody.eventId);
  });

  it('envia User-Agent próprio e headers de automação', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers['User-Agent']).toBe('RecepcaoIA-Automation/1.0');
    expect(options.headers['X-Automation-Event']).toBe('lead.created');
    expect(options.headers['X-Automation-Signature']).toMatch(/^sha256=[0-9a-f]{64}$/);
    expect(options.headers['X-Automation-Delivery']).toEqual(expect.any(String));
  });

  it('assina o corpo exato enviado (HMAC-SHA256 com o secret do webhook)', async () => {
    const crypto = require('crypto');
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    const [, options] = global.fetch.mock.calls[0];
    const expected = 'sha256=' + crypto.createHmac('sha256', 'plain-secret').update(options.body).digest('hex');
    expect(options.headers['X-Automation-Signature']).toBe(expected);
  });

  it('sucesso limpa lastError e atualiza lastSuccessAt do webhook', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: { id: 'lead-1' } });

    expect(automationWebhookRepository.update).toHaveBeenCalledWith(
      'webhook-1',
      expect.objectContaining({ lastError: null, lastSuccessAt: expect.any(Date) })
    );
  });

  it('nunca lança para quem chama, mesmo com fetch sempre falhando', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockRejectedValue(new Error('sempre falha'));

    await expect(dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: {} })).resolves.not.toThrow();
  });
});

describe('dispatch — retries', () => {
  it('HTTP 500 repete até esgotar as tentativas e grava um log por tentativa', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: {} });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(automationDispatchLogRepository.create).toHaveBeenCalledTimes(3);
    expect(automationWebhookRepository.update).toHaveBeenLastCalledWith(
      'webhook-1',
      expect.objectContaining({ lastError: expect.stringContaining('HTTP 500') })
    );
  });

  it('HTTP 404 não repete — uma única tentativa', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch.mockResolvedValue({ ok: false, status: 404 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: {} });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(automationDispatchLogRepository.create).toHaveBeenCalledTimes(1);
  });

  it('timeout (AbortError) é tratado como retryable e grava durationMs', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    const abortError = Object.assign(new Error('The operation was aborted'), { name: 'AbortError' });
    global.fetch.mockRejectedValue(abortError);

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: {} });

    expect(global.fetch).toHaveBeenCalledTimes(3);
    automationDispatchLogRepository.create.mock.calls.forEach(([logData]) => {
      expect(logData.errorType).toBe('TIMEOUT');
      expect(typeof logData.durationMs).toBe('number');
    });
  });

  it('recupera na 2ª tentativa após falha 5xx na 1ª', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    global.fetch
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: {} });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [firstLog, secondLog] = automationDispatchLogRepository.create.mock.calls.map(([d]) => d);
    expect(firstLog.success).toBe(false);
    expect(secondLog.success).toBe(true);
    expect(firstLog.deliveryId).toBe(secondLog.deliveryId); // mesma entrega, tentativas diferentes
  });
});

describe('dispatch — limite de tamanho do payload', () => {
  it('rejeita sem tentar enviar quando o payload excede o limite', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    const dataGigante = { texto: 'a'.repeat(300 * 1024) };

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: dataGigante });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(automationDispatchLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errorType: 'PAYLOAD_TOO_LARGE' })
    );
  });
});

describe('dispatch — revalidação de URL (proteção contra DNS rebinding)', () => {
  it('revalida a URL a cada disparo e bloqueia se ela deixou de ser pública', async () => {
    automationWebhookRepository.findAllByTenantAndEvent.mockResolvedValue([makeWebhook()]);
    urlSecurity.assertPublicHttpsUrl.mockRejectedValue(new Error('URL não pode apontar para IP privado.'));

    await dispatch('LEAD_CREATED', { tenantId: TENANT_ID, data: {} });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(automationDispatchLogRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, errorType: 'BLOCKED_URL' })
    );
  });
});

describe('sendTest', () => {
  it('lança 404 quando o webhook não pertence ao tenant', async () => {
    automationWebhookRepository.findById.mockResolvedValue(null);

    await expect(sendTest('webhook-x', TENANT_ID)).rejects.toMatchObject({ status: 404 });
  });

  it('faz uma única tentativa, sem retry, mesmo em caso de falha', async () => {
    automationWebhookRepository.findById.mockResolvedValue(makeWebhook());
    global.fetch.mockResolvedValue({ ok: false, status: 500 });

    const result = await sendTest('webhook-1', TENANT_ID);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(false);
    expect(result.httpStatus).toBe(500);
  });

  it('retorna resultado de sucesso de forma síncrona', async () => {
    automationWebhookRepository.findById.mockResolvedValue(makeWebhook());
    global.fetch.mockResolvedValue({ ok: true, status: 200 });

    const result = await sendTest('webhook-1', TENANT_ID);

    expect(result).toEqual(
      expect.objectContaining({ success: true, httpStatus: 200, durationMs: expect.any(Number) })
    );
  });
});

describe('listLogs', () => {
  it('lança 404 quando o webhook não pertence ao tenant', async () => {
    automationWebhookRepository.findById.mockResolvedValue(null);

    await expect(listLogs('webhook-x', TENANT_ID, {})).rejects.toMatchObject({ status: 404 });
    expect(automationDispatchLogRepository.findAllByWebhookId).not.toHaveBeenCalled();
  });

  it('pagina os logs daquele webhook/tenant', async () => {
    automationWebhookRepository.findById.mockResolvedValue(makeWebhook());
    automationDispatchLogRepository.findAllByWebhookId.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, perPage: 20, totalPages: 1 },
    });

    await listLogs('webhook-1', TENANT_ID, { page: '2', perPage: '10' });

    expect(automationDispatchLogRepository.findAllByWebhookId).toHaveBeenCalledWith({
      webhookId: 'webhook-1',
      tenantId: TENANT_ID,
      page: 2,
      perPage: 10,
    });
  });

  it('repassa o filtro success ao repository', async () => {
    automationWebhookRepository.findById.mockResolvedValue(makeWebhook());
    automationDispatchLogRepository.findAllByWebhookId.mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, perPage: 20, totalPages: 1 },
    });

    await listLogs('webhook-1', TENANT_ID, { success: false });

    expect(automationDispatchLogRepository.findAllByWebhookId).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});

describe('getStats', () => {
  it('conta apenas webhooks ativos', async () => {
    automationWebhookRepository.countActiveByTenantId.mockResolvedValue(3);
    automationDispatchLogRepository.findRecentByTenantId.mockResolvedValue([]);

    const stats = await getStats(TENANT_ID);

    expect(stats.activeWebhooks).toBe(3);
    expect(automationWebhookRepository.countActiveByTenantId).toHaveBeenCalledWith(TENANT_ID);
  });

  it('sem disparos nas últimas 24h retorna successRate nulo', async () => {
    automationWebhookRepository.countActiveByTenantId.mockResolvedValue(0);
    automationDispatchLogRepository.findRecentByTenantId.mockResolvedValue([]);

    const stats = await getStats(TENANT_ID);

    expect(stats.eventsLast24h).toBe(0);
    expect(stats.successRate).toBeNull();
    expect(stats.failuresLast24h).toBe(0);
  });

  it('conta uma entrega como sucesso se QUALQUER tentativa dela teve sucesso', async () => {
    automationWebhookRepository.countActiveByTenantId.mockResolvedValue(1);
    automationDispatchLogRepository.findRecentByTenantId.mockResolvedValue([
      { deliveryId: 'delivery-A', success: false }, // tentativa 1 falhou
      { deliveryId: 'delivery-A', success: true },  // tentativa 2 teve sucesso
      { deliveryId: 'delivery-B', success: false }, // única tentativa, falhou
    ]);

    const stats = await getStats(TENANT_ID);

    expect(stats.eventsLast24h).toBe(2); // 2 entregas distintas (deliveryId), não 3 tentativas
    expect(stats.failuresLast24h).toBe(1); // só delivery-B nunca teve sucesso
    expect(stats.successRate).toBe(0.5);
  });

  it('busca logs apenas da janela de 24h', async () => {
    automationWebhookRepository.countActiveByTenantId.mockResolvedValue(0);
    automationDispatchLogRepository.findRecentByTenantId.mockResolvedValue([]);

    const before = Date.now();
    await getStats(TENANT_ID);
    const after = Date.now();

    const [, since] = automationDispatchLogRepository.findRecentByTenantId.mock.calls[0];
    const elapsedMs = before - since.getTime();
    expect(elapsedMs).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 1000);
    expect(elapsedMs).toBeLessThanOrEqual(after - before + 24 * 60 * 60 * 1000 + 1000);
  });
});
