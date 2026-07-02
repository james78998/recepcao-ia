const { sendMessage, buildPayload } = require('../integrations/meta/whatsappClient');

const ORIGINAL_TOKEN = process.env.WHATSAPP_TOKEN;

afterAll(() => {
  if (ORIGINAL_TOKEN !== undefined) {
    process.env.WHATSAPP_TOKEN = ORIGINAL_TOKEN;
  } else {
    delete process.env.WHATSAPP_TOKEN;
  }
});

const BASE_PARAMS = {
  phoneNumberId: 'phone-id-123',
  to: '+5511999990001',
  type: 'text',
  text: { body: 'Olá, posso ajudar?' },
};

const META_SUCCESS = {
  messaging_product: 'whatsapp',
  contacts: [{ input: '5511999990001', wa_id: '5511999990001' }],
  messages: [{ id: 'wamid.HBgNABC123' }],
};

beforeEach(() => {
  process.env.WHATSAPP_TOKEN = 'test-token-123';
  global.fetch = jest.fn();
});

afterEach(() => {
  delete process.env.WHATSAPP_TOKEN;
  jest.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
describe('buildPayload', () => {
  it('monta payload de texto com preview_url=false', () => {
    const payload = buildPayload({ to: '+5511', type: 'text', text: { body: 'Oi' } });
    expect(payload).toMatchObject({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: '+5511',
      type: 'text',
      text: { preview_url: false, body: 'Oi' },
    });
  });

  it('não inclui campo text quando type !== text', () => {
    const payload = buildPayload({ to: '+5511', type: 'image', image: { link: 'http://img' } });
    expect(payload.text).toBeUndefined();
    expect(payload.image).toEqual({ link: 'http://img' });
  });

  it('inclui template quando type = template', () => {
    const tpl = { name: 'hello_world', language: { code: 'pt_BR' } };
    const payload = buildPayload({ to: '+5511', type: 'template', template: tpl });
    expect(payload.template).toEqual(tpl);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendMessage — sucesso', () => {
  it('envia POST para o endpoint correto da Meta', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => META_SUCCESS });

    await sendMessage(BASE_PARAMS);

    const [url] = global.fetch.mock.calls[0];
    expect(url).toMatch(/graph\.facebook\.com\/v21\.0\/phone-id-123\/messages/);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('envia o cabeçalho Authorization correto', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => META_SUCCESS });

    await sendMessage(BASE_PARAMS);

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer test-token-123');
  });

  it('retorna a resposta bruta da Meta com wamid', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => META_SUCCESS });

    const result = await sendMessage(BASE_PARAMS);

    expect(result.messages[0].id).toBe('wamid.HBgNABC123');
    expect(result.contacts[0].wa_id).toBe('5511999990001');
  });

  it('inclui AbortSignal no fetch (timeout configurado)', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => META_SUCCESS });

    await sendMessage(BASE_PARAMS);

    const [, options] = global.fetch.mock.calls[0];
    expect(options.signal).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendMessage — erros da Meta API', () => {
  it('lança erro com isMetaError=true para resposta 4xx', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => '{"error":{"message":"Phone number not in allowed list"}}',
    });

    const err = await sendMessage(BASE_PARAMS).catch((e) => e);
    expect(err.isMetaError).toBe(true);
    expect(err.message).toContain('Meta API 400');
    expect(err.status).toBe(400);
  });

  it('lança erro com isMetaError=true para resposta 5xx', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    });

    const err = await sendMessage(BASE_PARAMS).catch((e) => e);
    expect(err.isMetaError).toBe(true);
    expect(err.status).toBe(500);
  });

  it('propaga timeout como erro com name=TimeoutError', async () => {
    const timeoutErr = Object.assign(new Error('The operation timed out.'), {
      name: 'TimeoutError',
    });
    global.fetch.mockRejectedValue(timeoutErr);

    const err = await sendMessage(BASE_PARAMS).catch((e) => e);
    expect(err.name).toBe('TimeoutError');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('sendMessage — configuração ausente', () => {
  it('lança erro e não chama fetch quando WHATSAPP_TOKEN não está configurado', async () => {
    delete process.env.WHATSAPP_TOKEN;

    await expect(sendMessage(BASE_PARAMS)).rejects.toThrow('WHATSAPP_TOKEN não configurado');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
