const { complete } = require('../integrations/openai/openAiClient');

const ORIGINAL_KEY = process.env.OPENAI_API_KEY;

const BASE_PARAMS = {
  messages: [{ role: 'user', content: 'Olá' }],
  model: 'gpt-4o-mini',
  maxTokens: 300,
};

const OPENAI_SUCCESS = {
  choices: [{ message: { content: 'Olá! Como posso ajudar?' } }],
};

beforeEach(() => {
  global.fetch = jest.fn();
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  jest.restoreAllMocks();
  if (ORIGINAL_KEY !== undefined) {
    process.env.OPENAI_API_KEY = ORIGINAL_KEY;
  } else {
    delete process.env.OPENAI_API_KEY;
  }
});

describe('openAiClient.complete — chave', () => {
  it('usa a apiKey recebida por parâmetro, não a do env', async () => {
    process.env.OPENAI_API_KEY = 'sk-env-key';
    global.fetch.mockResolvedValue({ ok: true, json: async () => OPENAI_SUCCESS });

    await complete({ ...BASE_PARAMS, apiKey: 'sk-tenant-key' });

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer sk-tenant-key');
  });

  it('cai para OPENAI_API_KEY do env quando nenhuma apiKey é passada', async () => {
    process.env.OPENAI_API_KEY = 'sk-env-key';
    global.fetch.mockResolvedValue({ ok: true, json: async () => OPENAI_SUCCESS });

    await complete(BASE_PARAMS);

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer sk-env-key');
  });

  it('lança erro quando não há apiKey nem OPENAI_API_KEY', async () => {
    await expect(complete(BASE_PARAMS)).rejects.toThrow('OPENAI_API_KEY não configurado');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('openAiClient.complete — temperature', () => {
  it('inclui temperature no body quando fornecida', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => OPENAI_SUCCESS });

    await complete({ ...BASE_PARAMS, apiKey: 'sk-x', temperature: 0.7 });

    const [, options] = global.fetch.mock.calls[0];
    expect(JSON.parse(options.body).temperature).toBe(0.7);
  });

  it('não inclui temperature no body quando ausente', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => OPENAI_SUCCESS });

    await complete({ ...BASE_PARAMS, apiKey: 'sk-x' });

    const [, options] = global.fetch.mock.calls[0];
    expect(JSON.parse(options.body)).not.toHaveProperty('temperature');
  });
});

describe('openAiClient.complete — resposta', () => {
  it('retorna o conteúdo da primeira choice', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => OPENAI_SUCCESS });

    const result = await complete({ ...BASE_PARAMS, apiKey: 'sk-x' });

    expect(result).toBe('Olá! Como posso ajudar?');
  });

  it('lança erro com status quando a resposta não é ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' });

    await expect(complete({ ...BASE_PARAMS, apiKey: 'sk-x' })).rejects.toThrow('OpenAI 429');
  });
});
