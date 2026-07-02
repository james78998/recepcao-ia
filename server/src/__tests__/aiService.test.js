jest.mock('../repositories/messageRepository');
jest.mock('../integrations/openai/openAiClient');
jest.mock('../services/tenantAiConfigService');

const messageRepo = require('../repositories/messageRepository');
const openAiClient = require('../integrations/openai/openAiClient');
const tenantAiConfigService = require('../services/tenantAiConfigService');
const { generateReply, buildSystemPrompt } = require('../services/aiService');

// ── Fixtures ─────────────────────────────────────────────────────────────────
const TENANT = { id: 't1', name: 'Clínica Teste', aiEnabled: true };
const LEAD   = { id: 'l1', name: 'João Silva', status: 'NOVO', company: null, segment: null };
const CONV   = { id: 'c1', tenantId: 't1', leadId: 'l1' };

const INBOUND_HISTORY = [
  { direction: 'INBOUND',  content: 'mensagem anterior do lead' },
  { direction: 'INBOUND',  content: 'mensagem atual' }, // simula o INBOUND recém-salvo
];

const DEFAULT_AI_CONFIG = {
  apiKey: 'sk-env-key',
  model: 'gpt-4o-mini',
  customPrompt: null,
  temperature: undefined,
  maxTokens: 300,
};

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env.OPENAI_DRY_RUN;
  messageRepo.create.mockResolvedValue({ id: 'msg-draft-1' });
  tenantAiConfigService.getEffectiveConfig.mockResolvedValue(DEFAULT_AI_CONFIG);
});

// ─────────────────────────────────────────────────────────────────────────────
describe('buildSystemPrompt', () => {
  it('inclui o nome do tenant no prompt', () => {
    const prompt = buildSystemPrompt(TENANT, LEAD);
    expect(prompt).toContain('Clínica Teste');
  });

  it('inclui o nome do lead', () => {
    const prompt = buildSystemPrompt(TENANT, LEAD);
    expect(prompt).toContain('João Silva');
  });

  it('inclui status do CRM', () => {
    const prompt = buildSystemPrompt(TENANT, LEAD);
    expect(prompt).toContain('NOVO');
  });

  it('inclui empresa quando definida', () => {
    const prompt = buildSystemPrompt(TENANT, { ...LEAD, company: 'Empresa X' });
    expect(prompt).toContain('Empresa X');
  });

  it('não inclui linha de empresa quando null', () => {
    const prompt = buildSystemPrompt(TENANT, { ...LEAD, company: null });
    expect(prompt).not.toContain('Empresa:');
  });

  it('inclui segmento quando definido', () => {
    const prompt = buildSystemPrompt(TENANT, { ...LEAD, segment: 'Odontologia' });
    expect(prompt).toContain('Odontologia');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('generateReply — fluxo normal', () => {
  it('chama openAiClient.complete e salva mensagem OUTBOUND DRAFT com aiGenerated=true', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);
    openAiClient.complete.mockResolvedValue('Olá! Posso ajudar com o agendamento.');

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    expect(openAiClient.complete).toHaveBeenCalledTimes(1);
    expect(messageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 't1',
        conversationId: 'c1',
        leadId: 'l1',
        direction: 'OUTBOUND',
        status: 'DRAFT',
        aiGenerated: true,
        content: 'Olá! Posso ajudar com o agendamento.',
        wamid: null,
        sentAt: null,
      }),
    );
  });

  it('salva metadata com model e generatedAt', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);
    openAiClient.complete.mockResolvedValue('Resposta qualquer.');

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    const { metadata } = messageRepo.create.mock.calls[0][0];
    expect(metadata).toHaveProperty('model');
    expect(metadata).toHaveProperty('generatedAt');
    expect(typeof metadata.generatedAt).toBe('string');
  });

  it('não duplica o INBOUND recém-salvo no contexto (remove último item do histórico)', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);
    openAiClient.complete.mockResolvedValue('ok');

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    const callMessages = openAiClient.complete.mock.calls[0][0].messages;
    const userMessages = callMessages.filter(m => m.role === 'user');

    // prior history (1 item excluindo o último) + inboundText = 2 user messages
    expect(userMessages).toHaveLength(2);
    expect(userMessages[0].content).toBe('mensagem anterior do lead');
    expect(userMessages[1].content).toBe('mensagem atual');
  });

  it('funciona corretamente quando o histórico tem apenas o INBOUND atual (primeira mensagem)', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue([
      { direction: 'INBOUND', content: 'primeira mensagem' },
    ]);
    openAiClient.complete.mockResolvedValue('Olá, seja bem-vindo!');

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'primeira mensagem' });

    const callMessages = openAiClient.complete.mock.calls[0][0].messages;
    const userMessages = callMessages.filter(m => m.role === 'user');
    expect(userMessages).toHaveLength(1);
    expect(userMessages[0].content).toBe('primeira mensagem');
  });

  it('mapeia OUTBOUND anterior do histórico como role=assistant', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue([
      { direction: 'OUTBOUND', content: 'resposta anterior da IA' },
      { direction: 'INBOUND',  content: 'nova pergunta' },
    ]);
    openAiClient.complete.mockResolvedValue('nova resposta');

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'nova pergunta' });

    const callMessages = openAiClient.complete.mock.calls[0][0].messages;
    const assistantMessages = callMessages.filter(m => m.role === 'assistant');
    expect(assistantMessages).toHaveLength(1);
    expect(assistantMessages[0].content).toBe('resposta anterior da IA');
  });

  it('propaga erro do openAiClient para que o chamador possa fazer catch', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);
    openAiClient.complete.mockRejectedValue(new Error('OpenAI timeout'));

    await expect(
      generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' }),
    ).rejects.toThrow('OpenAI timeout');

    expect(messageRepo.create).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('generateReply — configuração de IA por tenant', () => {
  beforeEach(() => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);
    openAiClient.complete.mockResolvedValue('ok');
  });

  it('repassa model, maxTokens, temperature e apiKey do tenant para o openAiClient', async () => {
    tenantAiConfigService.getEffectiveConfig.mockResolvedValue({
      apiKey: 'sk-tenant-key',
      model: 'gpt-4o',
      customPrompt: null,
      temperature: 0.9,
      maxTokens: 800,
    });

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    expect(openAiClient.complete).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gpt-4o',
        maxTokens: 800,
        temperature: 0.9,
        apiKey: 'sk-tenant-key',
      }),
    );
  });

  it('soma o customPrompt do tenant às regras fixas na mensagem de sistema', async () => {
    tenantAiConfigService.getEffectiveConfig.mockResolvedValue({
      ...DEFAULT_AI_CONFIG,
      customPrompt: 'Sempre mencione o desconto de primeira consulta.',
    });

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    const systemMessage = openAiClient.complete.mock.calls[0][0].messages.find(m => m.role === 'system');
    expect(systemMessage.content).toContain('Regras obrigatórias:'); // regra fixa preservada
    expect(systemMessage.content).toContain('Sempre mencione o desconto de primeira consulta.');
  });

  it('não altera a mensagem de sistema quando o tenant não tem customPrompt', async () => {
    tenantAiConfigService.getEffectiveConfig.mockResolvedValue(DEFAULT_AI_CONFIG);

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    const systemMessage = openAiClient.complete.mock.calls[0][0].messages.find(m => m.role === 'system');
    expect(systemMessage.content).toBe(buildSystemPrompt(TENANT, LEAD));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('generateReply — OPENAI_DRY_RUN=true', () => {
  beforeEach(() => {
    process.env.OPENAI_DRY_RUN = 'true';
  });

  afterEach(() => {
    delete process.env.OPENAI_DRY_RUN;
  });

  it('não chama openAiClient.complete', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    expect(openAiClient.complete).not.toHaveBeenCalled();
  });

  it('salva rascunho com conteúdo [DRY RUN]', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    expect(messageRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'OUTBOUND',
        status: 'DRAFT',
        aiGenerated: true,
        content: expect.stringContaining('[DRY RUN]'),
      }),
    );
  });

  it('salva metadata com model=dry-run', async () => {
    messageRepo.getRecentByConversation.mockResolvedValue(INBOUND_HISTORY);

    await generateReply({ tenant: TENANT, lead: LEAD, conversation: CONV, inboundText: 'mensagem atual' });

    const { metadata } = messageRepo.create.mock.calls[0][0];
    expect(metadata.model).toBe('dry-run');
  });
});
