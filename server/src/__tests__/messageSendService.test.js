jest.mock('../repositories/messageRepository');
jest.mock('../integrations/meta/whatsappClient');
jest.mock('../utils/logger');

const messageRepo    = require('../repositories/messageRepository');
const whatsappClient = require('../integrations/meta/whatsappClient');
const { sendDraft }  = require('../services/messageSendService');

// ── Fixtures ─────────────────────────────────────────────────────────────────
const TENANT_ID = 'tenant-uuid-1';

const DRAFT_MESSAGE = {
  id: 'msg-uuid-1',
  tenantId: TENANT_ID,
  status: 'DRAFT',
  content: 'Olá, posso ajudar com o agendamento?',
  direction: 'OUTBOUND',
  tenant: { whatsappPhoneNumberId: 'phone-id-123' },
  lead:   { phoneNormalized: '5511999990001' },
};

const META_RESPONSE = {
  messaging_product: 'whatsapp',
  contacts: [{ input: '5511999990001', wa_id: '5511999990001' }],
  messages: [{ id: 'wamid.HBgNABC' }],
};

const SENT_MESSAGE = {
  id: DRAFT_MESSAGE.id,
  status: 'SENT',
  wamid: 'wamid.HBgNABC',
  sentAt: new Date(),
};

function setupSuccess() {
  messageRepo.findByIdWithRelations.mockResolvedValue(DRAFT_MESSAGE);
  messageRepo.markInFlight.mockResolvedValue({ count: 1 });
  whatsappClient.sendMessage.mockResolvedValue(META_RESPONSE);
  messageRepo.markSent.mockResolvedValue(SENT_MESSAGE);
}

beforeEach(() => {
  jest.clearAllMocks();
  messageRepo.markFailed.mockResolvedValue({ id: DRAFT_MESSAGE.id, status: 'FAILED' });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendDraft — sucesso', () => {
  it('retorna mensagem com status SENT e wamid preenchido', async () => {
    setupSuccess();

    const result = await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    expect(result.status).toBe('SENT');
    expect(result.wamid).toBe('wamid.HBgNABC');
  });

  it('chama whatsappClient com número no formato E.164 (+55...)', async () => {
    setupSuccess();

    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    expect(whatsappClient.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ to: '+5511999990001' }),
    );
  });

  it('passa o phone_number_id correto do tenant para o whatsappClient', async () => {
    setupSuccess();

    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    expect(whatsappClient.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumberId: 'phone-id-123' }),
    );
  });

  it('persiste wamid, sentAt e metadata com resposta bruta da Meta', async () => {
    setupSuccess();

    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    const [, { wamid, sentAt, metadata }] = messageRepo.markSent.mock.calls[0];
    expect(wamid).toBe('wamid.HBgNABC');
    expect(sentAt).toBeInstanceOf(Date);
    expect(metadata.metaResponse).toEqual(META_RESPONSE);
    expect(metadata.waId).toBe('5511999990001');
  });

  it('realiza a guarda atômica DRAFT → PENDING antes de chamar a Meta', async () => {
    setupSuccess();

    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    const inFlightOrder = messageRepo.markInFlight.mock.invocationCallOrder[0];
    const sendOrder     = whatsappClient.sendMessage.mock.invocationCallOrder[0];
    expect(inFlightOrder).toBeLessThan(sendOrder);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendDraft — erros de validação (pré-envio)', () => {
  it('lança 404 quando a mensagem não existe', async () => {
    messageRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(sendDraft('id-inexistente', TENANT_ID))
      .rejects.toMatchObject({ status: 404 });

    expect(whatsappClient.sendMessage).not.toHaveBeenCalled();
    expect(messageRepo.markInFlight).not.toHaveBeenCalled();
  });

  it('lança 404 para mensagem de outro tenant (sem vazar existência)', async () => {
    // findFirst com tenantId errado retorna null — idêntico ao "não encontrada"
    messageRepo.findByIdWithRelations.mockResolvedValue(null);

    await expect(sendDraft(DRAFT_MESSAGE.id, 'tenant-errado'))
      .rejects.toMatchObject({ status: 404 });
  });

  it('lança 409 quando status !== DRAFT (mensagem já enviada)', async () => {
    messageRepo.findByIdWithRelations.mockResolvedValue({ ...DRAFT_MESSAGE, status: 'SENT' });

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 409 });

    expect(messageRepo.markInFlight).not.toHaveBeenCalled();
  });

  it('lança 409 quando status = PENDING (envio já em andamento)', async () => {
    messageRepo.findByIdWithRelations.mockResolvedValue({ ...DRAFT_MESSAGE, status: 'PENDING' });

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 409 });
  });

  it('lança 422 quando tenant não tem whatsappPhoneNumberId', async () => {
    const msg = { ...DRAFT_MESSAGE, tenant: { whatsappPhoneNumberId: null } };
    messageRepo.findByIdWithRelations.mockResolvedValue(msg);

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 422 });

    expect(whatsappClient.sendMessage).not.toHaveBeenCalled();
  });

  it('lança 422 quando lead não tem phoneNormalized', async () => {
    const msg = { ...DRAFT_MESSAGE, lead: { phoneNormalized: null } };
    messageRepo.findByIdWithRelations.mockResolvedValue(msg);

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 422 });

    expect(whatsappClient.sendMessage).not.toHaveBeenCalled();
  });

  it('lança 409 quando guarda atômica retorna count=0 (race condition)', async () => {
    messageRepo.findByIdWithRelations.mockResolvedValue(DRAFT_MESSAGE);
    messageRepo.markInFlight.mockResolvedValue({ count: 0 });

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 409 });

    expect(whatsappClient.sendMessage).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendDraft — erros de envio (pós-guarda)', () => {
  it('marca FAILED e lança 502 em erro da Meta API (4xx)', async () => {
    const metaError = Object.assign(new Error('Meta API 400: bad request'), {
      status: 400,
      isMetaError: true,
    });
    messageRepo.findByIdWithRelations.mockResolvedValue(DRAFT_MESSAGE);
    messageRepo.markInFlight.mockResolvedValue({ count: 1 });
    whatsappClient.sendMessage.mockRejectedValue(metaError);

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 502 });

    expect(messageRepo.markFailed).toHaveBeenCalledWith(
      DRAFT_MESSAGE.id,
      expect.objectContaining({ error: expect.any(String), failedAt: expect.any(String) }),
    );
    expect(messageRepo.markSent).not.toHaveBeenCalled();
  });

  it('marca FAILED e lança 504 em timeout', async () => {
    const timeoutErr = Object.assign(new Error('The operation timed out.'), {
      name: 'TimeoutError',
    });
    messageRepo.findByIdWithRelations.mockResolvedValue(DRAFT_MESSAGE);
    messageRepo.markInFlight.mockResolvedValue({ count: 1 });
    whatsappClient.sendMessage.mockRejectedValue(timeoutErr);

    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 504 });

    expect(messageRepo.markFailed).toHaveBeenCalledTimes(1);
    expect(messageRepo.markSent).not.toHaveBeenCalled();
  });

  it('marca FAILED mesmo quando markFailed falha (não mascara o erro original)', async () => {
    const metaError = Object.assign(new Error('Meta API 500'), {
      isMetaError: true,
      status: 500,
    });
    messageRepo.findByIdWithRelations.mockResolvedValue(DRAFT_MESSAGE);
    messageRepo.markInFlight.mockResolvedValue({ count: 1 });
    whatsappClient.sendMessage.mockRejectedValue(metaError);
    messageRepo.markFailed.mockRejectedValue(new Error('DB offline'));

    // Deve lançar o AppError 502, não o erro do markFailed
    await expect(sendDraft(DRAFT_MESSAGE.id, TENANT_ID))
      .rejects.toMatchObject({ status: 502 });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendDraft — WHATSAPP_DRY_RUN=true', () => {
  beforeEach(() => {
    process.env.WHATSAPP_DRY_RUN = 'true';
    messageRepo.findByIdWithRelations.mockResolvedValue(DRAFT_MESSAGE);
    messageRepo.markInFlight.mockResolvedValue({ count: 1 });
    messageRepo.markSent.mockResolvedValue(SENT_MESSAGE);
  });

  afterEach(() => {
    delete process.env.WHATSAPP_DRY_RUN;
  });

  it('não chama whatsappClient.sendMessage', async () => {
    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);
    expect(whatsappClient.sendMessage).not.toHaveBeenCalled();
  });

  it('persiste SENT com wamid no formato dry-run', async () => {
    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    const [, { wamid }] = messageRepo.markSent.mock.calls[0];
    expect(wamid).toMatch(/^wamid\.dry-run\.\d+$/);
  });

  it('persiste metaResponse e waId na metadata', async () => {
    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);

    const [, { metadata }] = messageRepo.markSent.mock.calls[0];
    expect(metadata.metaResponse).toBeDefined();
    expect(metadata.waId).toBe(DRAFT_MESSAGE.lead.phoneNormalized);
  });

  it('ainda executa a guarda atômica DRAFT → PENDING antes de simular o envio', async () => {
    await sendDraft(DRAFT_MESSAGE.id, TENANT_ID);
    expect(messageRepo.markInFlight).toHaveBeenCalledWith(DRAFT_MESSAGE.id, TENANT_ID);
  });
});
